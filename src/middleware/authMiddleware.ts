import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TokenPayload {
  id: string;
  role: string;
}

interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Check if token is blacklisted
    const blacklistedToken = await prisma.blacklistedToken.findUnique({
      where: { token }
    });

    if (blacklistedToken) {
      return res.status(401).json({ message: 'Token has been invalidated' });
    }

    // if (!process.env.JWT_SECRET) {
    //   console.error('JWT_SECRET is not defined in environment variables');
    //   return res.status(500).json({ message: 'Server configuration error' });
    // }

    console.log('JWT_SECRET value:', process.env.JWT_SECRET || 'secret');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as TokenPayload;
    console.log('Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed', error: error });
  }
};
