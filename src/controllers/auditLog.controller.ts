import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const createAuditLog = async (req: AuthRequest, res: Response) => {
  try {
    const { action, details } = req.body;
    const userId = parseInt(req.user?.id || '0');

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.status(201).json(auditLog);
  } catch (error) {
    res.status(400).json({ message: 'Error creating audit log', error });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const auditLogs = await prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    const total = await prisma.auditLog.count();

    res.json({
      data: auditLogs,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching audit logs', error });
  }
};

export const getAuditLogsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const auditLogs = await prisma.auditLog.findMany({
      where: {
        userId: parseInt(userId)
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    const total = await prisma.auditLog.count({
      where: { userId: parseInt(userId) }
    });

    res.json({
      data: auditLogs,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching user audit logs', error });
  }
};
