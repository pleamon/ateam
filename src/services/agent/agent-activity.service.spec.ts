import { AgentActivityService } from './agent-activity.service';
import { prismaMock } from '../../test/setup';
import { mockProject, mockTeam } from '../../test/fixtures';

// Import setup
import '../../test/setup';

describe('AgentActivityService', () => {
  const mockAgent = {
    id: 'agent-1',
    name: 'Test Agent',
    description: 'Test agent description',
    projectId: 'project-1',
    teamId: 'team-1',
    workPrompt: null,
    responsibilities: ['coding', 'testing'],
    skills: ['JavaScript', 'TypeScript'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockActivity = {
    id: 'activity-1',
    agentId: 'agent-1',
    body: 'Agent started working on task',
    action: 'agent_work',
    details: { taskId: 'task-1' },
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAgentActivities', () => {
    it('should return agent activities with filters', async () => {
      const activities = [{
        ...mockActivity,
        agent: {
          ...mockAgent,
          team: mockTeam,
          project: mockProject,
        },
      }];
      
      prismaMock.agentActivity.findMany.mockResolvedValue(activities);
      prismaMock.agentActivity.count.mockResolvedValue(1);

      const result = await AgentActivityService.getAgentActivities({
        agentId: 'agent-1',
        action: 'agent_work',
        limit: 20,
        offset: 0,
      });

      expect(result.success).toBe(true);
      expect(result.data.activities).toEqual(activities);
      expect(result.data.total).toBe(1);
      expect(prismaMock.agentActivity.findMany).toHaveBeenCalledWith({
        where: {
          agentId: 'agent-1',
          action: 'agent_work',
        },
        include: expect.any(Object),
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        skip: 0,
      });
    });

    it('should handle date range filters', async () => {
      prismaMock.agentActivity.findMany.mockResolvedValue([]);
      prismaMock.agentActivity.count.mockResolvedValue(0);

      await AgentActivityService.getAgentActivities({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      });

      expect(prismaMock.agentActivity.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date('2024-01-01T00:00:00Z'),
            lte: new Date('2024-12-31T23:59:59Z'),
          },
        },
        include: expect.any(Object),
        orderBy: expect.any(Object),
        take: 20,
        skip: 0,
      });
    });

    it('should handle validation errors', async () => {
      await expect(AgentActivityService.getAgentActivities({
        limit: 200, // exceeds max
      })).rejects.toThrow('请求参数错误');
    });
  });

  describe('getAgentActivityById', () => {
    it('should return agent activity with full details', async () => {
      const fullActivity = {
        ...mockActivity,
        agent: {
          ...mockAgent,
          team: mockTeam,
          project: mockProject,
        },
      };

      prismaMock.agentActivity.findUnique.mockResolvedValue(fullActivity);

      const result = await AgentActivityService.getAgentActivityById('activity-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(fullActivity);
      expect(prismaMock.agentActivity.findUnique).toHaveBeenCalledWith({
        where: { id: 'activity-1' },
        include: {
          agent: {
            include: {
              team: true,
              project: true,
            },
          },
        },
      });
    });

    it('should throw error when activity not found', async () => {
      prismaMock.agentActivity.findUnique.mockResolvedValue(null);

      await expect(AgentActivityService.getAgentActivityById('non-existent'))
        .rejects.toThrow('获取代理活动详情失败');
    });
  });

  describe('createAgentActivity', () => {
    const createData = {
      agentId: 'agent-1',
      body: 'Agent checked in',
      action: 'agent_checkin' as const,
      details: { location: 'office' },
    };

    it('should create agent activity successfully', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(mockAgent);
      prismaMock.agentActivity.create.mockResolvedValue({
        ...mockActivity,
        ...createData,
        id: 'activity-new',
        agent: mockAgent,
      });

      const result = await AgentActivityService.createAgentActivity(createData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('代理活动创建成功');
      expect(prismaMock.agent.findUnique).toHaveBeenCalledWith({
        where: { id: 'agent-1' },
      });
      expect(prismaMock.agentActivity.create).toHaveBeenCalledWith({
        data: createData,
        include: {
          agent: true,
        },
      });
    });

    it('should throw error when agent not found', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(null);

      await expect(AgentActivityService.createAgentActivity(createData))
        .rejects.toThrow('代理不存在');
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        agentId: '',
        body: 'Test',
        action: 'agent_checkin' as const,
      };

      await expect(AgentActivityService.createAgentActivity(invalidData))
        .rejects.toThrow('请求参数错误');
    });
  });

  describe('deleteAgentActivity', () => {
    it('should delete agent activity successfully', async () => {
      prismaMock.agentActivity.delete.mockResolvedValue(mockActivity);

      const result = await AgentActivityService.deleteAgentActivity('activity-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('代理活动删除成功');
      expect(prismaMock.agentActivity.delete).toHaveBeenCalledWith({
        where: { id: 'activity-1' },
      });
    });

    it('should handle delete errors', async () => {
      prismaMock.agentActivity.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(AgentActivityService.deleteAgentActivity('activity-1'))
        .rejects.toThrow('删除代理活动失败');
    });
  });

  describe('batchCreateActivities', () => {
    const batchData = [
      {
        agentId: 'agent-1',
        body: 'Activity 1',
        action: 'agent_work' as const,
      },
      {
        agentId: 'agent-2',
        body: 'Activity 2',
        action: 'agent_checkin' as const,
      },
    ];

    it('should batch create activities successfully', async () => {
      prismaMock.agent.findMany.mockResolvedValue([
        { id: 'agent-1' },
        { id: 'agent-2' },
      ]);
      prismaMock.agentActivity.createMany.mockResolvedValue({ count: 2 });

      const result = await AgentActivityService.batchCreateActivities(batchData);

      expect(result.success).toBe(true);
      expect(result.data.created).toBe(2);
      expect(result.message).toBe('成功创建 2 个活动记录');
      expect(prismaMock.agent.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['agent-1', 'agent-2'] },
        },
        select: { id: true },
      });
    });

    it('should throw error when some agents not found', async () => {
      prismaMock.agent.findMany.mockResolvedValue([
        { id: 'agent-1' },
      ]);

      await expect(AgentActivityService.batchCreateActivities(batchData))
        .rejects.toThrow('以下代理不存在: agent-2');
    });

    it('should handle validation errors', async () => {
      const invalidBatch = [
        {
          agentId: '',
          body: 'Activity',
          action: 'agent_work' as const,
        },
      ];

      await expect(AgentActivityService.batchCreateActivities(invalidBatch))
        .rejects.toThrow('请求参数错误');
    });
  });

  describe('getAgentActivityStats', () => {
    it('should return agent activity statistics', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      prismaMock.agentActivity.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(20)  // today
        .mockResolvedValueOnce(50); // week

      prismaMock.agentActivity.groupBy.mockResolvedValue([
        { action: 'agent_work', _count: 40 },
        { action: 'agent_checkin', _count: 30 },
        { action: 'agent_checkout', _count: 20 },
        { action: 'agent_submit_work', _count: 10 },
      ]);

      const result = await AgentActivityService.getAgentActivityStats('agent-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        total: 100,
        byAction: {
          agent_work: 40,
          agent_checkin: 30,
          agent_checkout: 20,
          agent_submit_work: 10,
        },
        todayCount: 20,
        weekCount: 50,
      });
    });

    it('should handle errors', async () => {
      prismaMock.agentActivity.count.mockRejectedValue(new Error('Count failed'));

      await expect(AgentActivityService.getAgentActivityStats('agent-1'))
        .rejects.toThrow('获取代理活动统计失败');
    });
  });

  describe('getRecentActivities', () => {
    it('should return recent activities', async () => {
      const recentActivities = [
        {
          ...mockActivity,
          agent: {
            id: mockAgent.id,
            name: mockAgent.name,
            team: {
              id: mockTeam.id,
              name: mockTeam.name,
            },
          },
        },
      ];

      prismaMock.agentActivity.findMany.mockResolvedValue(recentActivities);

      const result = await AgentActivityService.getRecentActivities(10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(recentActivities);
      expect(prismaMock.agentActivity.findMany).toHaveBeenCalledWith({
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });
    });

    it('should handle errors', async () => {
      prismaMock.agentActivity.findMany.mockRejectedValue(new Error('Query failed'));

      await expect(AgentActivityService.getRecentActivities())
        .rejects.toThrow('获取最近活动失败');
    });
  });

  describe('getAgentLastActivity', () => {
    it('should return agent last activity', async () => {
      const lastActivity = {
        ...mockActivity,
        agent: mockAgent,
      };

      prismaMock.agentActivity.findFirst.mockResolvedValue(lastActivity);

      const result = await AgentActivityService.getAgentLastActivity('agent-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(lastActivity);
      expect(prismaMock.agentActivity.findFirst).toHaveBeenCalledWith({
        where: { agentId: 'agent-1' },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          agent: true,
        },
      });
    });

    it('should handle errors', async () => {
      prismaMock.agentActivity.findFirst.mockRejectedValue(new Error('Query failed'));

      await expect(AgentActivityService.getAgentLastActivity('agent-1'))
        .rejects.toThrow('获取代理最后活动失败');
    });
  });

  describe('cleanupOldActivities', () => {
    it('should cleanup old activities successfully', async () => {
      prismaMock.agentActivity.deleteMany.mockResolvedValue({ count: 50 });

      const result = await AgentActivityService.cleanupOldActivities(30);

      expect(result.success).toBe(true);
      expect(result.data.deleted).toBe(50);
      expect(result.message).toBe('成功删除 50 条过期活动记录');

      const expectedCutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      expect(prismaMock.agentActivity.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date),
          },
        },
      });

      // Verify the date is approximately correct (within 1 second)
      const actualDate = prismaMock.agentActivity.deleteMany.mock.calls[0][0].where.createdAt.lt;
      expect(Math.abs(actualDate.getTime() - expectedCutoffDate.getTime())).toBeLessThan(1000);
    });

    it('should handle errors', async () => {
      prismaMock.agentActivity.deleteMany.mockRejectedValue(new Error('Delete failed'));

      await expect(AgentActivityService.cleanupOldActivities())
        .rejects.toThrow('清理过期活动记录失败');
    });
  });
});