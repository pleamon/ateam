import { AuditLogService } from './audit-log.service';
import { prismaMock } from '../../test/setup';
import { mockUser } from '../../test/fixtures';

// Import setup
import '../../test/setup';

describe('AuditLogService', () => {
  const mockAuditLog = {
    id: 'log-1',
    userId: 'user-1',
    action: 'CREATE',
    resource: 'PROJECT',
    resourceId: 'project-1',
    details: { name: 'New Project' },
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date('2024-01-01'),
  };

  describe('getAuditLogs', () => {
    it('should return audit logs with pagination', async () => {
      const logs = [mockAuditLog];
      prismaMock.auditLog.findMany.mockResolvedValue(logs);
      prismaMock.auditLog.count.mockResolvedValue(1);

      const result = await AuditLogService.getAuditLogs({
        limit: 10,
        offset: 0,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        logs,
        total: 1,
        limit: 10,
        offset: 0,
      });
    });

    it('should filter by query parameters', async () => {
      prismaMock.auditLog.findMany.mockResolvedValue([]);
      prismaMock.auditLog.count.mockResolvedValue(0);

      await AuditLogService.getAuditLogs({
        userId: 'user-1',
        resource: 'PROJECT',
        action: 'CREATE',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        limit: 10,
        offset: 0,
      });

      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          resource: 'PROJECT',
          action: 'CREATE',
          createdAt: {
            gte: new Date('2024-01-01T00:00:00Z'),
            lte: new Date('2024-01-31T23:59:59Z'),
          },
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should handle invalid query parameters', async () => {
      await expect(AuditLogService.getAuditLogs({
        limit: 0, // Invalid
        offset: -1, // Invalid
      })).rejects.toThrow('请求参数错误');
    });
  });

  describe('createAuditLog', () => {
    const createData = {
      userId: 'user-1',
      action: 'CREATE',
      resource: 'PROJECT',
      resourceId: 'project-1',
      details: { name: 'New Project' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    };

    it('should create audit log successfully', async () => {
      prismaMock.auditLog.create.mockResolvedValue(mockAuditLog);

      const result = await AuditLogService.createAuditLog(createData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuditLog);
      expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it('should create audit log without optional fields', async () => {
      const minimalData = {
        action: 'VIEW',
        resource: 'DOCUMENT',
      };
      prismaMock.auditLog.create.mockResolvedValue({
        ...mockAuditLog,
        userId: null,
        resourceId: null,
      });

      const result = await AuditLogService.createAuditLog(minimalData);

      expect(result.success).toBe(true);
    });

    it('should handle invalid data', async () => {
      await expect(AuditLogService.createAuditLog({
        action: '', // Invalid
        resource: 'PROJECT',
      })).rejects.toThrow('请求参数错误');
    });
  });

  describe('createBatchAuditLogs', () => {
    it('should create multiple audit logs', async () => {
      const logs = [
        { action: 'CREATE', resource: 'PROJECT' },
        { action: 'UPDATE', resource: 'PROJECT' },
        { action: 'DELETE', resource: 'PROJECT' },
      ];
      prismaMock.auditLog.createMany.mockResolvedValue({ count: 3 });

      const result = await AuditLogService.createBatchAuditLogs(logs);

      expect(result.success).toBe(true);
      expect(result.data.count).toBe(3);
    });

    it('should validate all logs in batch', async () => {
      const invalidLogs = [
        { action: 'CREATE', resource: 'PROJECT' },
        { action: '', resource: 'PROJECT' }, // Invalid
      ];

      await expect(AuditLogService.createBatchAuditLogs(invalidLogs))
        .rejects.toThrow('请求参数错误');
    });
  });

  describe('getUserActionStats', () => {
    it('should return user action statistics', async () => {
      const logs = [
        { action: 'CREATE', resource: 'PROJECT' },
        { action: 'CREATE', resource: 'DOCUMENT' },
        { action: 'UPDATE', resource: 'PROJECT' },
        { action: 'DELETE', resource: 'DOCUMENT' },
      ];
      prismaMock.auditLog.findMany.mockResolvedValue(logs);

      const result = await AuditLogService.getUserActionStats('user-1', 30);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalActions: 4,
        actionStats: {
          CREATE: 2,
          UPDATE: 1,
          DELETE: 1,
        },
        resourceStats: {
          PROJECT: 2,
          DOCUMENT: 2,
        },
        period: {
          start: expect.any(Date),
          end: expect.any(Date),
          days: 30,
        },
      });
    });

    it('should handle empty results', async () => {
      prismaMock.auditLog.findMany.mockResolvedValue([]);

      const result = await AuditLogService.getUserActionStats('user-1');

      expect(result.data.totalActions).toBe(0);
      expect(result.data.actionStats).toEqual({});
      expect(result.data.resourceStats).toEqual({});
    });
  });

  describe('getResourceHistory', () => {
    it('should return resource operation history', async () => {
      const logs = [
        { ...mockAuditLog, action: 'CREATE', user: mockUser },
        { ...mockAuditLog, action: 'UPDATE', user: mockUser },
      ];
      prismaMock.auditLog.findMany.mockResolvedValue(logs);

      const result = await AuditLogService.getResourceHistory('PROJECT', 'project-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(logs);
      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          resource: 'PROJECT',
          resourceId: 'project-1',
        },
        include: {
          user: {
            select: expect.any(Object),
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('cleanOldLogs', () => {
    it('should delete old logs', async () => {
      prismaMock.auditLog.deleteMany.mockResolvedValue({ count: 100 });

      const result = await AuditLogService.cleanOldLogs(90);

      expect(result.success).toBe(true);
      expect(result.data.deleted).toBe(100);
      expect(result.message).toBe('清理了 100 条过期日志');

      const expectedCutoff = new Date();
      expectedCutoff.setDate(expectedCutoff.getDate() - 90);
      
      expect(prismaMock.auditLog.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date),
          },
        },
      });
    });

    it('should use default retention period', async () => {
      prismaMock.auditLog.deleteMany.mockResolvedValue({ count: 0 });

      await AuditLogService.cleanOldLogs();

      expect(prismaMock.auditLog.deleteMany).toHaveBeenCalled();
    });
  });

  describe('getSystemStats', () => {
    it('should return system statistics', async () => {
      const logs = [
        { ...mockAuditLog, createdAt: new Date('2024-01-01T10:00:00'), userId: 'user-1' },
        { ...mockAuditLog, createdAt: new Date('2024-01-01T14:00:00'), userId: 'user-1' },
        { ...mockAuditLog, createdAt: new Date('2024-01-02T10:00:00'), userId: 'user-2' },
      ];
      prismaMock.auditLog.findMany.mockResolvedValue(logs);

      const result = await AuditLogService.getSystemStats(7);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        total: 3,
        dailyStats: {
          '2024-01-01': 2,
          '2024-01-02': 1,
        },
        hourlyStats: {
          10: 2,
          14: 1,
        },
        topUsers: [
          { userId: 'user-1', count: 2 },
          { userId: 'user-2', count: 1 },
        ],
      });
    });

    it('should handle logs without userId', async () => {
      const logs = [
        { ...mockAuditLog, userId: null },
        { ...mockAuditLog, userId: 'user-1' },
      ];
      prismaMock.auditLog.findMany.mockResolvedValue(logs);

      const result = await AuditLogService.getSystemStats();

      expect(result.data.topUsers).toEqual([
        { userId: 'user-1', count: 1 },
      ]);
    });
  });
});