import { z } from 'zod';
import { Paper } from '../models/Paper.js';
import * as openalex from '../services/openalexService.js';

const paperInputSchema = z.object({
  openalexId: z.string().optional(),
  doi: z.string().nullish(),
  title: z.string().min(1).max(500),
  authors: z.array(z.string()).default([]),
  abstract: z.string().default(''),
  year: z.number().int().nullish(),
  venue: z.string().default(''),
  citationsCount: z.number().int().default(0),
  concepts: z.array(z.string()).default([]),
  referencedWorks: z.array(z.string()).default([]),
  url: z.string().default(''),
  status: z.enum(['want-to-read', 'reading', 'read']).default('want-to-read'),
  tags: z.array(z.string()).default([]),
  notes: z.string().default(''),
  rating: z.number().min(0).max(5).default(0),
  isHighlight: z.boolean().default(false),
});

export async function search(req, res, next) {
  try {
    const q = String(req.query.q || '').trim();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    if (!q) return res.json({ total: 0, page, perPage: 10, results: [] });
    const data = await openalex.searchWorks({ q, page, perPage: 10 });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { status, tag, q, sort = 'recent' } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (tag) filter.tags = String(tag).toLowerCase();
    if (q) filter.$text = { $search: String(q) };

    const sortMap = {
      recent: { createdAt: -1 },
      oldest: { createdAt: 1 },
      year: { year: -1 },
      citations: { citationsCount: -1 },
      rating: { rating: -1, createdAt: -1 },
      debt: { createdAt: 1 },
    };

    const papers = await Paper.find(filter).sort(sortMap[sort] || sortMap.recent).limit(200);
    res.json({ papers });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const data = paperInputSchema.parse(req.body);
    const paper = await Paper.create({ ...data, user: req.user._id });
    res.status(201).json({ paper });
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const paper = await Paper.findOne({ _id: req.params.id, user: req.user._id });
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    res.json({ paper });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const allowed = ['status', 'tags', 'notes', 'rating', 'isHighlight', 'title', 'abstract'];
    const updates = {};
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }
    if (updates.status === 'read') updates.readAt = new Date();
    const paper = await Paper.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    res.json({ paper });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const paper = await Paper.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function stats(req, res, next) {
  try {
    const userId = req.user._id;
    const [total, byStatus, byYear, topTags, oldestUnread] = await Promise.all([
      Paper.countDocuments({ user: userId }),
      Paper.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Paper.aggregate([
        { $match: { user: userId, year: { $ne: null } } },
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Paper.aggregate([
        { $match: { user: userId } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Paper.findOne({ user: userId, status: { $ne: 'read' } }).sort({ createdAt: 1 }),
    ]);

    res.json({
      total,
      byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      byYear: byYear.map((y) => ({ year: y._id, count: y.count })),
      topTags: topTags.map((t) => ({ tag: t._id, count: t.count })),
      oldestUnread,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Serendipity recommendations.
 *
 * Approach: find papers that are cited BY papers in the user's library but
 * that are NOT already in the library. Rank by "co-citation strength"
 * (how many of the user's papers reference each candidate) adjusted by the
 * user's serendipityLevel — a higher level trades strength for diversity by
 * sampling further down the ranked list.
 *
 * Grounded in information foraging theory: proximate items in the citation
 * network carry strong "information scent," while sampling further-out items
 * supports serendipitous discovery (Foster & Ford, 2003).
 */
export async function recommend(req, res, next) {
  try {
    const library = await Paper.find({ user: req.user._id })
      .select('openalexId referencedWorks concepts')
      .lean();

    if (library.length === 0) {
      return res.json({ recommendations: [], note: 'Add papers to your library to get recommendations.' });
    }

    const ownedIds = new Set(library.map((p) => p.openalexId).filter(Boolean));
    const refCounts = new Map();
    for (const p of library) {
      for (const refId of p.referencedWorks || []) {
        if (ownedIds.has(refId)) continue;
        refCounts.set(refId, (refCounts.get(refId) || 0) + 1);
      }
    }

    const ranked = [...refCounts.entries()].sort((a, b) => b[1] - a[1]);
    if (ranked.length === 0) {
      return res.json({ recommendations: [], note: 'No cited works found in your library yet.' });
    }

    const serendipity = req.user.serendipityLevel ?? 40;
    const skip = Math.floor((ranked.length - 1) * (serendipity / 100) * 0.5);
    const picked = ranked.slice(skip, skip + 10).map(([id, strength]) => ({ id, strength }));

    const works = await openalex.getWorksByIds(picked.map((p) => p.id));
    const strengthMap = new Map(picked.map((p) => [p.id, p.strength]));
    const recommendations = works
      .map((w) => ({ ...w, coCitationStrength: strengthMap.get(w.openalexId) || 0 }))
      .sort((a, b) => b.coCitationStrength - a.coCitationStrength);

    res.json({ recommendations, serendipityLevel: serendipity });
  } catch (err) {
    next(err);
  }
}
