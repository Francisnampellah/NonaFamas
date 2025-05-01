import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  console.log('Registering user:', { name, email, role });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user', details: error });
    console.error('Error registering user:', error);
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '7d' });
    
    res.status(200).json({ 
      message: 'Login successful', 
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error logging in', details: error });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Invalidate the token on the client side by clearing it
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Error during logout', details: error });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, SECRET_KEY) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: parseInt(decoded.id) } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newAccessToken = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '7d' });

    res.status(200).json({
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};