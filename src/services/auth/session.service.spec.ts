
// Import setup
import '../../test/setup';

import { SessionService } from './session.service';
import { prismaMock } from '../../test/setup';
import { mockSession, expiredSession, mockUser, createMockSession } from '../../test/fixtures';

// Mock crypto
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mock-token-123'),
  })),
}));

describe('SessionService', () => {
  describe('getAllSessions', () => {
    it('should return all sessions', async () => {
      const sessions = [mockSession];
      prismaMock.session.findMany.mockResolvedValue(sessions);

      const result = await SessionService.getAllSessions();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(sessions);
      expect(prismaMock.session.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: {
          user: {
            select: expect.any(Object),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return sessions for specific user', async () => {
      const sessions = [mockSession];
      prismaMock.session.findMany.mockResolvedValue(sessions);

      const result = await SessionService.getAllSessions('user-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(sessions);
      expect(prismaMock.session.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should handle errors', async () => {
      prismaMock.session.findMany.mockRejectedValue(new Error('Database error'));

      await expect(SessionService.getAllSessions()).rejects.toThrow('获取会话列表失败');
    });
  });

  describe('getSessionById', () => {
    it('should return session by id', async () => {
      prismaMock.session.findUnique.mockResolvedValue(mockSession);

      const result = await SessionService.getSessionById('session-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSession);
      expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        include: expect.any(Object),
      });
    });

    it('should throw error when session not found', async () => {
      prismaMock.session.findUnique.mockResolvedValue(null);

      await expect(SessionService.getSessionById('non-existent')).rejects.toThrow('获取会话详情失败');
    });
  });

  describe('getSessionByToken', () => {
    it('should return valid session by token', async () => {
      const sessionWithUser = {
        ...mockSession,
        user: { ...mockUser, isActive: true },
      };
      prismaMock.session.findUnique.mockResolvedValue(sessionWithUser);

      const result = await SessionService.getSessionByToken('test-token-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(sessionWithUser);
    });

    it('should throw error when session not found', async () => {
      prismaMock.session.findUnique.mockResolvedValue(null);

      await expect(SessionService.getSessionByToken('invalid-token'))
        .rejects.toThrow('会话不存在');
    });

    it('should throw error when session is expired', async () => {
      const expiredSessionWithUser = {
        ...expiredSession,
        user: { ...mockUser, isActive: true },
      };
      prismaMock.session.findUnique.mockResolvedValue(expiredSessionWithUser);

      await expect(SessionService.getSessionByToken('expired-token'))
        .rejects.toThrow('会话已过期');
    });

    it('should throw error when user is inactive', async () => {
      const sessionWithInactiveUser = {
        ...mockSession,
        user: { ...mockUser, isActive: false },
      };
      prismaMock.session.findUnique.mockResolvedValue(sessionWithInactiveUser);

      await expect(SessionService.getSessionByToken('test-token'))
        .rejects.toThrow('用户已被禁用');
    });
  });

  describe('createSession', () => {
    const createSessionData = {
      userId: 'user-1',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      expiresIn: 86400,
    };

    it('should create a new session successfully', async () => {
      const createdSession = {
        ...mockSession,
        token: 'mock-token-123',
      };
      prismaMock.session.create.mockResolvedValue(createdSession);
      prismaMock.user.update.mockResolvedValue(mockUser);

      const result = await SessionService.createSession(createSessionData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdSession);
      expect(result.message).toBe('会话创建成功');
      expect(prismaMock.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          token: 'mock-token-123',
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          expiresAt: expect.any(Date),
        }),
        include: expect.any(Object),
      });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('should throw error on invalid data', async () => {
      const invalidData = { ...createSessionData, userId: '' };

      await expect(SessionService.createSession(invalidData)).rejects.toThrow('请求参数错误');
    });
  });

  describe('updateSession', () => {
    const updateData = {
      expiresAt: new Date(Date.now() + 172800000).toISOString(), // 48 hours from now
    };

    it('should update session successfully', async () => {
      const updatedSession = {
        ...mockSession,
        expiresAt: new Date(updateData.expiresAt),
      };
      prismaMock.session.update.mockResolvedValue(updatedSession);

      const result = await SessionService.updateSession('session-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedSession);
      expect(result.message).toBe('会话更新成功');
    });
  });

  describe('extendSession', () => {
    it('should extend session successfully', async () => {
      prismaMock.session.findUnique.mockResolvedValue(mockSession);
      const extendedSession = {
        ...mockSession,
        expiresAt: new Date(mockSession.expiresAt.getTime() + 86400000),
      };
      prismaMock.session.update.mockResolvedValue(extendedSession);

      const result = await SessionService.extendSession('session-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(extendedSession);
      expect(result.message).toBe('会话延长成功');
    });

    it('should throw error when session not found', async () => {
      prismaMock.session.findUnique.mockResolvedValue(null);

      await expect(SessionService.extendSession('non-existent'))
        .rejects.toThrow('会话不存在');
    });
  });

  describe('deleteSession', () => {
    it('should delete session successfully', async () => {
      prismaMock.session.delete.mockResolvedValue(mockSession);

      const result = await SessionService.deleteSession('session-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('会话删除成功');
      expect(prismaMock.session.delete).toHaveBeenCalledWith({
        where: { id: 'session-1' },
      });
    });
  });

  describe('deleteSessionByToken', () => {
    it('should delete session by token successfully', async () => {
      prismaMock.session.delete.mockResolvedValue(mockSession);

      const result = await SessionService.deleteSessionByToken('test-token-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('会话删除成功');
      expect(prismaMock.session.delete).toHaveBeenCalledWith({
        where: { token: 'test-token-123' },
      });
    });
  });

  describe('deleteUserSessions', () => {
    it('should delete all user sessions', async () => {
      prismaMock.session.deleteMany.mockResolvedValue({ count: 3 });

      const result = await SessionService.deleteUserSessions('user-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ count: 3 });
      expect(result.message).toBe('删除了 3 个会话');
      expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });

  describe('cleanExpiredSessions', () => {
    it('should clean expired sessions', async () => {
      prismaMock.session.deleteMany.mockResolvedValue({ count: 5 });

      const result = await SessionService.cleanExpiredSessions();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ count: 5 });
      expect(result.message).toBe('清理了 5 个过期会话');
      expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });

  describe('getActiveSessionStats', () => {
    it('should return session statistics', async () => {
      prismaMock.session.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80)  // active
        .mockResolvedValueOnce(20)  // expired
        .mockResolvedValueOnce(30); // recent

      const result = await SessionService.getActiveSessionStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalSessions: 100,
        activeSessions: 80,
        expiredSessions: 20,
        recentSessions: 30,
      });
    });
  });

  describe('validateSession', () => {
    it('should validate active session without extending', async () => {
      const futureSession = {
        ...mockSession,
        expiresAt: new Date(Date.now() + 7200000), // 2 hours from now
        user: { ...mockUser, isActive: true },
      };
      prismaMock.session.findUnique.mockResolvedValue(futureSession);

      const result = await SessionService.validateSession('test-token-123');

      expect(result.success).toBe(true);
      expect(result.data.valid).toBe(true);
      expect(result.data.session).toEqual(futureSession);
      expect(prismaMock.session.update).not.toHaveBeenCalled();
    });

    it('should validate and extend session when expiring soon', async () => {
      const expiringSoonSession = {
        ...mockSession,
        expiresAt: new Date(Date.now() + 1800000), // 30 minutes from now
        user: { ...mockUser, isActive: true },
      };
      prismaMock.session.findUnique.mockResolvedValue(expiringSoonSession);
      prismaMock.session.update.mockResolvedValue(expiringSoonSession);

      const result = await SessionService.validateSession('test-token-123');

      expect(result.success).toBe(true);
      expect(result.data.valid).toBe(true);
      expect(prismaMock.session.update).toHaveBeenCalled();
    });

    it('should return invalid for expired or non-existent session', async () => {
      prismaMock.session.findUnique.mockResolvedValue(null);

      const result = await SessionService.validateSession('invalid-token');

      expect(result.success).toBe(false);
      expect(result.data.valid).toBe(false);
    });
  });
});