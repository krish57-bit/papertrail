import { z } from 'zod';
import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req, res, next) {
  try {
    const { username, email, password } = registerSchema.parse(req.body);
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ username, email, passwordHash });
    const token = signToken(user._id);
    res.status(201).json({ user: user.toPublicJSON(), token });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user._id);
    res.json({ user: user.toPublicJSON(), token });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: req.user.toPublicJSON() });
}

export async function updateMe(req, res, next) {
  try {
    const { bio, publicProfile, serendipityLevel } = req.body;
    if (typeof bio === 'string') req.user.bio = bio.slice(0, 300);
    if (typeof publicProfile === 'boolean') req.user.publicProfile = publicProfile;
    if (Number.isFinite(serendipityLevel)) {
      req.user.serendipityLevel = Math.max(0, Math.min(100, serendipityLevel));
    }
    await req.user.save();
    res.json({ user: req.user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}
