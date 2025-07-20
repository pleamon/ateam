import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { DocumentationService } from '../documentation/index.js';

const prisma = new PrismaClient();

// Agent 工作记录 schema
const agentWorklogSchema = z.object({
  projectId: z.string().uuid(),
  agentId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  workType: z.enum(['documentation', 'architecture', 'code', 'test', 'other']),
  summarize: z.string().optional(),
  nextPlan: z.string().optional(),
  content: z.string().min(1, '工作日志不能为空'),
  metadata: z.record(z.any()).optional(),
});

// 工作成果提交 schema
const submitWorkSchema = z.object({
  projectId: z.string().uuid(),
  agentId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  workType: z.enum(['documentation', 'architecture', 'code', 'test', 'other']),
  summarize: z.string().optional(),
  nextPlan: z.string().optional(),
  content: z.string().min(1, '工作日志不能为空'),
  metadata: z.record(z.any()).optional(),
});

export class AgentService {
  /**
   * 获取 Agent 的待办任务
   */
  static async getAgentTasks(agentId: string) {
    const tasks = await prisma.agentTask.findMany({
      where: {
        agentId,
        task: {
          status: {
            in: ['todo', 'in_progress'],
          },
        },
      },
      include: {
        task: {
          include: {
            sprint: true,
            feature: {
              include: {
                milestone: true,
                version: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return tasks.map((mt) => ({
      taskId: mt.task.id,
      title: mt.task.title,
      content: mt.task.content,
      status: mt.task.status,
      dueDate: mt.task.dueDate,
      feature: mt.task.featureId,
      sprint: mt.task.sprint,
      assignedAt: mt.createdAt,
    }));
  }

  /**
   * 获取任务的完整上下文
   */
  static async getTaskContext(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        team: true,
        feature: {
          include: {
            milestone: true,
            version: true,
          },
        },
        sprint: true,
      },
    });

    if (!task) {
      throw new Error('任务不存在');
    }

    // 获取相关的需求文档
    const requirements = await prisma.requirement.findMany({
      where: {
        projectId: task.projectId,
        teamId: task.teamId,
      },
    });

    // 获取系统架构
    const architecture = await prisma.systemArchitecture.findFirst({
      where: {
        projectId: task.projectId,
      },
      include: {
        platformArchitectures: true,
      },
    });

    // 获取相关文档
    const documentation = await prisma.documentation.findMany({
      where: {
        projectId: task.projectId,
      },
    });

    // 获取领域知识
    const domainKnowledge = await prisma.domainKnowledge.findMany({
      where: {
        projectId: task.projectId,
      },
    });

    return {
      task,
      requirements,
      architecture,
      documentation,
      domainKnowledge,
      feature: task.feature,
      milestone: task.feature?.milestone,
      version: task.feature?.version,
    };
  }

  /**
   * 记录 Agent 工作日志
   */
  static async recordWorklog(data: z.infer<typeof agentWorklogSchema>) {
    const validatedData = agentWorklogSchema.parse(data);

    // 由于 validatedData 里的 projectId/agentId 可能是可选的，需确保类型兼容
    const worklog = await prisma.agentWorklog.create({
      data: {
        projectId: validatedData.projectId,
        agentId: validatedData.agentId,
        taskId: validatedData.taskId,
        workType: validatedData.workType,
        summarize: validatedData.summarize,
        nextPlan: validatedData.nextPlan,
        content: validatedData.content,
        metadata: validatedData.metadata,
      },
    });

    // 记录活动
    await prisma.agentActivity.create({
      data: {
        agentId: validatedData.agentId,
        action: 'agent_work',
        body: validatedData.content,
        details: {
          taskId: validatedData.taskId,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return worklog;
  }

  /**
   * 提交工作成果
   */
  static async submitWork(data: z.infer<typeof submitWorkSchema>) {
    const validatedData = submitWorkSchema.parse(data);

    // 根据工作类型处理不同的提交
    let result;

    switch (validatedData.workType) {
      case 'documentation': {
        const { name, type } = validatedData.metadata as any;
        result = await DocumentationService.createDocumentation({
          projectId: validatedData.metadata?.projectId as string,
          agentId: validatedData.agentId,
          name,
          content: validatedData.content,
          type: type || 'other',
        });
        break;
      }

      case 'architecture': {
        // 创建或更新系统架构
        const { projectId } = validatedData.metadata as any;
        let architecture = await prisma.systemArchitecture.findFirst({
          where: { projectId },
        });

        if (!architecture) {
          architecture = await prisma.systemArchitecture.create({
            data: {
              projectId,
              overview: validatedData.content,
              technologies: [],
              components: [],
            },
          });
        } else {
          architecture = await prisma.systemArchitecture.update({
            where: { id: architecture.id },
            data: {
              overview: validatedData.content,
            },
          });
        }
        result = architecture;
        break;
      }

      case 'code': {
        // 记录代码提交（实际项目中可能需要与版本控制系统集成）
        const worklog = await this.recordWorklog({
          agentId: validatedData.agentId,
          taskId: validatedData.taskId,
          content: `提交代码: ${validatedData.content}`,
          projectId: validatedData.metadata?.projectId as string,
        });
        result = worklog;
        break;
      }

      case 'test': {
        // 记录测试用例
        const worklog = await this.recordWorklog({
          agentId: validatedData.agentId,
          taskId: validatedData.taskId,
          content: `提交测试用例: ${validatedData.content}`,
          projectId: validatedData.metadata?.projectId as string,
        });
        result = worklog;
        break;
      }

      default: {
        // 其他类型的工作成果
        const worklog = await this.recordWorklog({
          agentId: validatedData.agentId,
          taskId: validatedData.taskId,
          content: validatedData.content,
          projectId: validatedData.metadata?.projectId as string,
        });
        result = worklog;
      }
    }

    // 如果有关联的任务，更新任务状态
    if (validatedData.taskId) {
      await prisma.agentTask.updateMany({
        where: {
          agentId: validatedData.agentId,
          taskId: validatedData.taskId,
        },
        data: {
          status: 'done',
        },
      });
    }

    return {
      success: true,
      workType: validatedData.workType,
      result,
    };
  }

  /**
   * 获取 Agent 的工作提示词
   */
  static async getAgentPrompt(teamMemberId: string) {
    const teamMember = await prisma.agent.findUnique({
      where: { id: teamMemberId },
    });

    if (!teamMember) {
      throw new Error('Team member not found');
    }

    // 如果有自定义提示词，使用自定义的
    if (teamMember.workPrompt) {
      return { prompt: teamMember.workPrompt, isCustom: true };
    }

    // 否则，根据职责查找模板
    const responsibility = teamMember.responsibilities[0];
    const template = await prisma.agentPromptTemplate.findFirst({
      where: {
        responsibility,
        isActive: true,
      },
    });

    return {
      prompt: template?.prompt || '请根据任务要求完成工作',
      isCustom: false,
      templateId: template?.id,
    };
  }

  /**
   * Agent 请求协作
   */
  static async requestCollaboration(fromMemberId: string, toMemberId: string, context: any) {
    // 创建协作记录
    const activity = await prisma.memberActivity.create({
      data: {
        teamMemberId: fromMemberId,
        action: 'collaboration_request',
        details: {
          toMemberId,
          context,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // 可以在这里添加通知机制

    return {
      success: true,
      activityId: activity.id,
      message: '协作请求已发送',
    };
  }
}
