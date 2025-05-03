import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const cleanupExpiredTokens = async () => {
  try {
    const result = await prisma.blacklistedToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    console.log(`Cleaned up ${result.count} expired blacklisted tokens`);
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
}; 