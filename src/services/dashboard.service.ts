import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardService {
  /**
   * 获取仪表盘统计数据
   */
  static async getDashboardStats() {
    try {
      // 并行获取所有统计数据
      const [
        projectCount,
        teamCount,
        memberCount,
        taskStats,
        sprintStats,
        docStats,
        recentProjects,
        recentTasks,
        activeSprints,
      ] = await Promise.all([
        // 项目统计
        prisma.project.count(),

        // 团队统计
        prisma.team.count(),

        // 成员统计
        prisma.teamMember.count(),

        // 任务统计
        Promise.all([
          prisma.task.count(),
          prisma.task.count({ where: { status: 'todo' } }),
          prisma.task.count({ where: { status: 'in_progress' } }),
          prisma.task.count({ where: { status: 'testing' } }),
          prisma.task.count({ where: { status: 'done' } }),
        ]),

        // Sprint统计
        Promise.all([
          prisma.sprint.count(),
          prisma.sprint.count({ where: { status: 'active' } }),
          prisma.sprint.count({ where: { status: 'completed' } }),
        ]),

        // 文档统计
        Promise.all([
          prisma.documentation.count(),
          prisma.documentation.count({ where: { type: 'overview' } }),
          prisma.documentation.count({ where: { type: 'technical' } }),
          prisma.documentation.count({ where: { type: 'design' } }),
        ]),

        // 最近项目
        prisma.project.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                tasks: true,
                documentation: true,
                Sprint: true,
              },
            },
          },
        }),

        // 最近任务
        prisma.task.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            project: true,
            team: true,
          },
        }),

        // 活跃Sprint
        prisma.sprint.findMany({
          where: { status: 'active' },
          include: {
            project: true,
          },
        }),
      ]);

      // 计算任务完成率
      const [totalTasks, todoTasks, inProgressTasks, testingTasks, doneTasks] = taskStats;
      const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      // 计算Sprint统计
      const [totalSprints, activeSprintCount, completedSprints] = sprintStats;

      // 计算文档统计
      const [totalDocs, overviewDocs, technicalDocs, designDocs] = docStats;

      return {
        success: true,
        data: {
          // 基础统计
          overview: {
            projectCount,
            teamCount,
            memberCount,
            totalTasks,
            totalSprints,
            totalDocs,
          },

          // 任务统计
          taskStats: {
            total: totalTasks,
            todo: todoTasks,
            inProgress: inProgressTasks,
            testing: testingTasks,
            done: doneTasks,
            completionRate,
          },

          // Sprint统计
          sprintStats: {
            total: totalSprints,
            active: activeSprintCount,
            completed: completedSprints,
          },

          // 文档统计
          docStats: {
            total: totalDocs,
            overview: overviewDocs,
            technical: technicalDocs,
            design: designDocs,
          },

          // 最近数据
          recent: {
            projects: recentProjects,
            tasks: recentTasks,
            activeSprints,
          },

          // 图表数据
          charts: {
            taskStatusDistribution: [
              { status: '待办', count: todoTasks, color: '#1890ff' },
              { status: '进行中', count: inProgressTasks, color: '#faad14' },
              { status: '测试中', count: testingTasks, color: '#722ed1' },
              { status: '已完成', count: doneTasks, color: '#52c41a' },
            ],
            docTypeDistribution: [
              { type: '概览文档', count: overviewDocs, color: '#1890ff' },
              { type: '技术文档', count: technicalDocs, color: '#13c2c2' },
              { type: '设计文档', count: designDocs, color: '#eb2f96' },
            ],
          },
        },
      };
    } catch {
      throw new Error('获取仪表盘统计数据失败');
    }
  }

  /**
   * 获取项目仪表盘数据
   */
  static async getProjectDashboard(projectId: string) {
    try {
      const [project, taskStats, sprintStats, docStats, recentTasks, activeSprint] =
        await Promise.all([
          // 项目信息
          prisma.project.findUnique({
            where: { id: projectId },
            include: {
              _count: {
                select: {
                  tasks: true,
                  documentation: true,
                  Sprint: true,
                },
              },
            },
          }),

          // 项目任务统计
          Promise.all([
            prisma.task.count({ where: { projectId } }),
            prisma.task.count({ where: { projectId, status: 'todo' } }),
            prisma.task.count({ where: { projectId, status: 'in_progress' } }),
            prisma.task.count({ where: { projectId, status: 'testing' } }),
            prisma.task.count({ where: { projectId, status: 'done' } }),
          ]),

          // 项目Sprint统计
          Promise.all([
            prisma.sprint.count({ where: { projectId } }),
            prisma.sprint.count({ where: { projectId, status: 'active' } }),
            prisma.sprint.count({ where: { projectId, status: 'completed' } }),
          ]),

          // 项目文档统计
          Promise.all([
            prisma.documentation.count({ where: { projectId } }),
            prisma.documentation.count({
              where: { projectId, type: 'overview' },
            }),
            prisma.documentation.count({
              where: { projectId, type: 'technical' },
            }),
            prisma.documentation.count({ where: { projectId, type: 'design' } }),
          ]),

          // 最近任务
          prisma.task.findMany({
            where: { projectId },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              team: true,
            },
          }),

          // 活跃Sprint
          prisma.sprint.findFirst({
            where: { projectId, status: 'active' },
          }),
        ]);

      if (!project) {
        throw new Error('项目不存在');
      }

      const [totalTasks, todoTasks, inProgressTasks, testingTasks, doneTasks] = taskStats;
      const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      const [totalSprints, activeSprintCount, completedSprints] = sprintStats;
      const [totalDocs, overviewDocs, technicalDocs, designDocs] = docStats;

      return {
        success: true,
        data: {
          // 概览统计
          overview: {
            projectCount: 1,
            teamCount: await prisma.team.count({
              where: {
                tasks: {
                  some: { projectId },
                },
              },
            }),
            memberCount: await prisma.teamMember.count({
              where: {
                team: {
                  tasks: {
                    some: { projectId },
                  },
                },
              },
            }),
            totalTasks,
            totalSprints,
            totalDocs,
          },

          taskStats: {
            total: totalTasks,
            todo: todoTasks,
            inProgress: inProgressTasks,
            testing: testingTasks,
            done: doneTasks,
            completionRate,
          },

          sprintStats: {
            total: totalSprints,
            active: activeSprintCount,
            completed: completedSprints,
          },

          docStats: {
            total: totalDocs,
            overview: overviewDocs,
            technical: technicalDocs,
            design: designDocs,
          },

          recent: {
            projects: [project],
            tasks: recentTasks,
            activeSprints: activeSprint ? [activeSprint] : [],
          },

          // 图表数据
          charts: {
            taskStatusDistribution: [
              { status: '待办', count: todoTasks, color: '#1890ff' },
              { status: '进行中', count: inProgressTasks, color: '#faad14' },
              { status: '测试中', count: testingTasks, color: '#722ed1' },
              { status: '已完成', count: doneTasks, color: '#52c41a' },
            ],
            docTypeDistribution: [
              { type: '概览文档', count: overviewDocs, color: '#1890ff' },
              { type: '技术文档', count: technicalDocs, color: '#13c2c2' },
              { type: '设计文档', count: designDocs, color: '#eb2f96' },
            ],
          },
        },
      };
    } catch {
      throw new Error('获取项目仪表盘数据失败');
    }
  }
}
