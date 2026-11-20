import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma.js';

const AUTH_SECRET = process.env.AUTH_SECRET || 'imdb_clone_super_secret_jwt_key_2026_dev_mode';

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  avatar: z.string().url().optional().or(z.literal('')),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

function generateToken(user: { id: string; email: string; name: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    AUTH_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.errors[0]?.message || 'Invalid input data',
        details: parseResult.error.errors,
      });
    }

    const { name, email, password, avatar } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=252525&color=F5C518`,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Registration successful',
      user,
      token,
    });
  } catch (error) {
    console.error('[Auth Controller: register]', error);
    return res.status(500).json({ error: 'Failed to register user. Please try again.' });
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.errors[0]?.message || 'Invalid email or password',
      });
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('[Auth Controller: login]', error);
    return res.status(500).json({ error: 'Failed to log in. Please try again.' });
  }
}

// POST /api/auth/logout
export async function logout(_req: Request, res: Response) {
  return res.status(200).json({ message: 'Logged out successfully.' });
}

// GET /api/auth/me
export async function getMe(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            watchlist: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        stats: {
          watchlistCount: user._count.watchlist,
          reviewsCount: user._count.reviews,
        },
      },
    });
  } catch (error) {
    console.error('[Auth Controller: getMe]', error);
    return res.status(500).json({ error: 'Failed to retrieve current user profile.' });
  }
}
