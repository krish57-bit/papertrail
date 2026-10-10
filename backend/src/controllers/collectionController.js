import { z } from 'zod';
import { Collection } from '../models/Collection.js';
import { Paper } from '../models/Paper.js';

const collectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).default(''),
  isPublic: z.boolean().default(false),
  papers: z.array(z.string()).default([]),
});

export async function list(req, res, next) {
  try {
    const collections = await Collection.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('papers', 'title authors year');
    res.json({ collections });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const data = collectionSchema.parse(req.body);
    const owned = await Paper.find({ _id: { $in: data.papers }, user: req.user._id }).select('_id');
    const paperIds = owned.map((p) => p._id);
    const collection = await Collection.create({
      ...data,
      papers: paperIds,
      user: req.user._id,
    });
    res.status(201).json({ collection });
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id })
      .populate('papers');
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json({ collection });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const allowed = ['name', 'description', 'isPublic', 'papers'];
    const updates = {};
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }
    if (updates.papers) {
      const owned = await Paper.find({ _id: { $in: updates.papers }, user: req.user._id }).select('_id');
      updates.papers = owned.map((p) => p._id);
    }
    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('papers');
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json({ collection });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const collection = await Collection.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function listPublic(req, res, next) {
  try {
    const collections = await Collection.find({ isPublic: true })
      .sort({ updatedAt: -1 })
      .limit(50)
      .populate('user', 'username')
      .populate('papers', 'title year');
    res.json({ collections });
  } catch (err) {
    next(err);
  }
}

export async function getPublicBySlug(req, res, next) {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug, isPublic: true })
      .populate('user', 'username bio')
      .populate('papers');
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json({ collection });
  } catch (err) {
    next(err);
  }
}
