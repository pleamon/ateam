import { AgentTaskService } from './agent-task.service';
import { prismaMock } from '../../test/setup';
import { mockUser, mockProject, mockTeam } from '../../test/fixtures';

// Import setup
import '../../test/setup';

describe('AgentTaskService', () => {
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

  const mockSprint = {
    id: 'sprint-1',
    projectId: 'project-1',
    name: 'Sprint 1',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-14'),
    goal: 'Complete user authentication',
    status: 'in_progress',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockTask = {
    id: 'task-1',
    projectId: 'project-1',
    sprintId: 'sprint-1',
    teamId: 'team-1',
    title: 'Implement login feature',
    content: 'Add user authentication with JWT',
    status: 'todo',
    dueDate: null,
    featureId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockAgentTask = {
    id: 'agent-task-1',
    agentId: 'agent-1',
    taskId: 'task-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAgentTasks', () => {
    it('should return agent tasks with filters', async () => {
      const agentTasks = [{
        ...mockAgentTask,
        agent: {
          ...mockAgent,
          team: mockTeam,
          project: mockProject,
        },
        task: {
          ...mockTask,
          project: mockProject,
          team: mockTeam,
          sprint: mockSprint,
        },
      }];
      
      prismaMock.agentTask.findMany.mockResolvedValue(agentTasks);
      prismaMock.agentTask.count.mockResolvedValue(1);

      const result = await AgentTaskService.getAgentTasks({
        agentId: 'agent-1',
        limit: 20,
        offset: 0,
      });

      expect(result.success).toBe(true);
      expect(result.data.tasks).toEqual(agentTasks);
      expect(result.data.total).toBe(1);
      expect(prismaMock.agentTask.findMany).toHaveBeenCalledWith({
        where: {
          agentId: 'agent-1',
        },
        include: expect.any(Object),
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        skip: 0,
      });
    });

    it('should handle validation errors', async () => {
      await expect(AgentTaskService.getAgentTasks({
        limit: 200, // exceeds max
      })).rejects.toThrow('请求参数错误');
    });
  });

  describe('getAgentTaskById', () => {
    it('should return agent task with full details', async () => {
      const fullAgentTask = {
        ...mockAgentTask,
        agent: {
          ...mockAgent,
          team: mockTeam,
          project: mockProject,
        },
        task: {
          ...mockTask,
          project: mockProject,
          team: mockTeam,
          sprint: mockSprint,
        },
      };

      prismaMock.agentTask.findUnique.mockResolvedValue(fullAgentTask);

      const result = await AgentTaskService.getAgentTaskById('agent-task-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(fullAgentTask);
      expect(prismaMock.agentTask.findUnique).toHaveBeenCalledWith({
        where: { id: 'agent-task-1' },
        include: expect.objectContaining({
          agent: expect.any(Object),
          task: expect.any(Object),
        }),
      });
    });

    it('should throw error when agent task not found', async () => {
      prismaMock.agentTask.findUnique.mockResolvedValue(null);

      await expect(AgentTaskService.getAgentTaskById('non-existent'))
        .rejects.toThrow('获取代理任务详情失败');
    });
  });

  describe('createAgentTask', () => {
    const createData = {
      agentId: 'agent-1',
      taskId: 'task-1',
    };

    it('should create agent task successfully', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(mockAgent);
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.agentTask.findFirst.mockResolvedValue(null);
      prismaMock.agentTask.create.mockResolvedValue({
        ...mockAgentTask,
        agent: mockAgent,
        task: mockTask,
      });
      prismaMock.agentActivity.create.mockResolvedValue({
        id: 'activity-1',
        agentId: 'agent-1',
        body: `任务 "${mockTask.title}" 已分配给代理 ${mockAgent.name}`,
        action: 'agent_work',
        details: {
          taskId: mockTask.id,
          taskTitle: mockTask.title,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await AgentTaskService.createAgentTask(createData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('代理任务创建成功');
      expect(prismaMock.agent.findUnique).toHaveBeenCalledWith({
        where: { id: 'agent-1' },
      });
      expect(prismaMock.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'task-1' },
      });
      expect(prismaMock.agentTask.create).toHaveBeenCalledWith({
        data: {
          agentId: 'agent-1',
          taskId: 'task-1',
        },
        include: expect.any(Object),
      });
    });

    it('should throw error when agent not found', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(null);

      await expect(AgentTaskService.createAgentTask(createData))
        .rejects.toThrow('代理不存在');
    });

    it('should throw error when task not found', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(mockAgent);
      prismaMock.task.findUnique.mockResolvedValue(null);

      await expect(AgentTaskService.createAgentTask(createData))
        .rejects.toThrow('任务不存在');
    });

    it('should throw error when task already assigned', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(mockAgent);
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.agentTask.findFirst.mockResolvedValue(mockAgentTask);

      await expect(AgentTaskService.createAgentTask(createData))
        .rejects.toThrow('任务已分配给该代理');
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        agentId: '',
        taskId: 'task-1',
      };

      await expect(AgentTaskService.createAgentTask(invalidData))
        .rejects.toThrow('请求参数错误');
    });
  });

  describe('deleteAgentTask', () => {
    it('should delete agent task successfully', async () => {
      prismaMock.agentTask.delete.mockResolvedValue(mockAgentTask);

      const result = await AgentTaskService.deleteAgentTask('agent-task-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('代理任务删除成功');
      expect(prismaMock.agentTask.delete).toHaveBeenCalledWith({
        where: { id: 'agent-task-1' },
      });
    });

    it('should handle delete errors', async () => {
      prismaMock.agentTask.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(AgentTaskService.deleteAgentTask('agent-task-1'))
        .rejects.toThrow('删除代理任务失败');
    });
  });

  describe('batchAssignTasks', () => {
    const batchData = {
      agentId: 'agent-1',
      taskIds: ['task-1', 'task-2', 'task-3'],
    };

    it('should batch assign tasks successfully', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(mockAgent);
      prismaMock.agentTask.findMany.mockResolvedValue([
        { taskId: 'task-1' },
      ]);
      prismaMock.agentTask.createMany.mockResolvedValue({ count: 2 });

      const result = await AgentTaskService.batchAssignTasks(batchData);

      expect(result.success).toBe(true);
      expect(result.data.created).toBe(2);
      expect(result.data.skipped).toBe(1);
      expect(result.message).toBe('成功分配 2 个任务');
      expect(prismaMock.agentTask.createMany).toHaveBeenCalledWith({
        data: [
          {
            agentId: 'agent-1',
            taskId: 'task-2',
          },
          {
            agentId: 'agent-1',
            taskId: 'task-3',
          },
        ],
      });
    });

    it('should throw error when agent not found', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(null);

      await expect(AgentTaskService.batchAssignTasks(batchData))
        .rejects.toThrow('代理不存在');
    });

    it('should throw error when all tasks already assigned', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(mockAgent);
      prismaMock.agentTask.findMany.mockResolvedValue([
        { taskId: 'task-1' },
        { taskId: 'task-2' },
        { taskId: 'task-3' },
      ]);

      await expect(AgentTaskService.batchAssignTasks(batchData))
        .rejects.toThrow('所有任务都已分配给该代理');
    });
  });

  describe('getAgentTaskStats', () => {
    it('should return agent task statistics', async () => {
      const tasksWithDetails = [
        {
          ...mockAgentTask,
          task: { status: 'todo', dueDate: null },
        },
        {
          ...mockAgentTask,
          id: 'agent-task-2',
          task: { status: 'in_progress', dueDate: null },
        },
        {
          ...mockAgentTask,
          id: 'agent-task-3',
          task: { status: 'done', dueDate: null },
        },
        {
          ...mockAgentTask,
          id: 'agent-task-4',
          task: { status: 'todo', dueDate: new Date('2023-12-31') }, // overdue
        },
      ];

      prismaMock.agentTask.count.mockResolvedValue(4);
      prismaMock.agentTask.findMany.mockResolvedValue(tasksWithDetails);

      const result = await AgentTaskService.getAgentTaskStats('agent-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        total: 4,
        byStatus: {
          todo: 2,
          in_progress: 1,
          done: 1,
        },
        overdue: 1,
        completionRate: 25,
      });
    });

    it('should handle zero tasks', async () => {
      prismaMock.agentTask.count.mockResolvedValue(0);
      prismaMock.agentTask.findMany.mockResolvedValue([]);

      const result = await AgentTaskService.getAgentTaskStats('agent-1');

      expect(result.data.completionRate).toBe(0);
      expect(result.data.byStatus).toEqual({});
    });

    it('should handle errors', async () => {
      prismaMock.agentTask.count.mockRejectedValue(new Error('Count failed'));

      await expect(AgentTaskService.getAgentTaskStats('agent-1'))
        .rejects.toThrow('获取代理任务统计失败');
    });
  });

  describe('getTaskAssignmentHistory', () => {
    it('should return task assignment history', async () => {
      const assignments = [
        {
          ...mockAgentTask,
          agent: {
            id: mockAgent.id,
            name: mockAgent.name,
            team: {
              id: mockTeam.id,
              name: mockTeam.name,
            },
          },
        },
        {
          ...mockAgentTask,
          id: 'agent-task-2',
          agentId: 'agent-2',
          createdAt: new Date('2024-01-02'),
          agent: {
            id: 'agent-2',
            name: 'Agent 2',
            team: {
              id: mockTeam.id,
              name: mockTeam.name,
            },
          },
        },
      ];

      prismaMock.agentTask.findMany.mockResolvedValue(assignments);

      const result = await AgentTaskService.getTaskAssignmentHistory('task-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(assignments);
      expect(prismaMock.agentTask.findMany).toHaveBeenCalledWith({
        where: { taskId: 'task-1' },
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
      });
    });

    it('should handle errors', async () => {
      prismaMock.agentTask.findMany.mockRejectedValue(new Error('Query failed'));

      await expect(AgentTaskService.getTaskAssignmentHistory('task-1'))
        .rejects.toThrow('获取任务分配历史失败');
    });
  });

  describe('getAgentTaskIds', () => {
    it('should return agent task IDs', async () => {
      const agentTasks = [
        { taskId: 'task-1' },
        { taskId: 'task-2' },
        { taskId: 'task-3' },
      ];

      prismaMock.agentTask.findMany.mockResolvedValue(agentTasks);

      const result = await AgentTaskService.getAgentTaskIds('agent-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(['task-1', 'task-2', 'task-3']);
      expect(prismaMock.agentTask.findMany).toHaveBeenCalledWith({
        where: { agentId: 'agent-1' },
        select: { taskId: true },
      });
    });

    it('should handle errors', async () => {
      prismaMock.agentTask.findMany.mockRejectedValue(new Error('Query failed'));

      await expect(AgentTaskService.getAgentTaskIds('agent-1'))
        .rejects.toThrow('获取代理任务ID列表失败');
    });
  });

  describe('removeAgentTask', () => {
    it('should remove agent task successfully', async () => {
      prismaMock.agentTask.findFirst.mockResolvedValue(mockAgentTask);
      prismaMock.agentTask.delete.mockResolvedValue(mockAgentTask);
      prismaMock.agent.findUnique.mockResolvedValue({ name: mockAgent.name });
      prismaMock.task.findUnique.mockResolvedValue({ title: mockTask.title });
      prismaMock.agentActivity.create.mockResolvedValue({
        id: 'activity-1',
        agentId: 'agent-1',
        body: `任务 "${mockTask.title}" 已从代理 ${mockAgent.name} 移除`,
        action: 'agent_work',
        details: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await AgentTaskService.removeAgentTask('agent-1', 'task-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('任务分配已移除');
      expect(prismaMock.agentTask.delete).toHaveBeenCalledWith({
        where: { id: 'agent-task-1' },
      });
    });

    it('should throw error when assignment not found', async () => {
      prismaMock.agentTask.findFirst.mockResolvedValue(null);

      await expect(AgentTaskService.removeAgentTask('agent-1', 'task-1'))
        .rejects.toThrow('任务分配不存在');
    });
  });
});