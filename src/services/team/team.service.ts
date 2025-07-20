import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 请求验证schema
const createTeamSchema = z.object({
  name: z.string().min(1, '团队名称不能为空'),
  description: z.string().optional(),
});

const updateTeamSchema = z.object({
  name: z.string().min(1, '团队名称不能为空').optional(),
  description: z.string().optional(),
});

const createTeamMemberSchema = z.object({
  responsibilities: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});

const updateTeamMemberSchema = z.object({
  responsibilities: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});

export class TeamService {
  /**
   * 获取所有团队
   */
  static async getAllTeams(projectId?: string) {
    try {
      const teams = await prisma.team.findMany({
        where: projectId
          ? {
              tasks: {
                some: {
                  projectId,
                },
              },
            }
          : undefined,
        include: {
          tasks: true,
          TeamMember: true,
          Documentation: true,
        },
      });

      return {
        success: true,
        data: teams,
      };
    } catch {
      throw new Error('获取团队列表失败');
    }
  }

  /**
   * 根据ID获取团队
   */
  static async getTeamById(id: string) {
    try {
      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          tasks: true,
          TeamMember: {
            include: {
              TeamMemberTask: true,
              TeamMemberWorklog: true,
              MemberActivity: true,
            },
          },
          Documentation: true,
        },
      });

      if (!team) {
        throw new Error('团队不存在');
      }

      return {
        success: true,
        data: team,
      };
    } catch {
      throw new Error('获取团队详情失败');
    }
  }

  /**
   * 创建团队
   */
  static async createTeam(data: z.infer<typeof createTeamSchema>) {
    try {
      const validatedData = createTeamSchema.parse(data);

      const team = await prisma.team.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
        },
      });

      return {
        success: true,
        data: team,
        message: '团队创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建团队失败');
    }
  }

  /**
   * 更新团队
   */
  static async updateTeam(id: string, data: z.infer<typeof updateTeamSchema>) {
    try {
      const validatedData = updateTeamSchema.parse(data);

      const team = await prisma.team.update({
        where: { id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
        },
      });

      return {
        success: true,
        data: team,
        message: '团队更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新团队失败');
    }
  }

  /**
   * 删除团队
   */
  static async deleteTeam(id: string) {
    try {
      await prisma.team.delete({
        where: { id },
      });

      return {
        success: true,
        message: '团队删除成功',
      };
    } catch {
      throw new Error('删除团队失败');
    }
  }

  /**
   * 添加团队成员
   */
  static async addTeamMember(teamId: string, data: z.infer<typeof createTeamMemberSchema>) {
    try {
      const validatedData = createTeamMemberSchema.parse(data);

      const teamMember = await prisma.teamMember.create({
        data: {
          teamId,
          responsibilities: validatedData.responsibilities || [],
          skills: validatedData.skills || [],
        },
      });

      return {
        success: true,
        data: teamMember,
        message: '团队成员添加成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('添加团队成员失败');
    }
  }

  /**
   * 获取团队成员
   */
  static async getTeamMembers(teamId: string) {
    try {
      const members = await prisma.teamMember.findMany({
        where: { teamId },
        include: {
          TeamMemberTask: true,
          TeamMemberWorklog: true,
          MemberActivity: true,
        },
      });

      return {
        success: true,
        data: members,
      };
    } catch {
      throw new Error('获取团队成员失败');
    }
  }

  /**
   * 获取团队统计信息
   */
  static async getTeamStats(teamId: string) {
    try {
      const [memberCount, taskCount, docCount] = await Promise.all([
        prisma.teamMember.count({ where: { teamId } }),
        prisma.task.count({ where: { teamId } }),
        prisma.documentation.count({ where: { teamId } }),
      ]);

      return {
        success: true,
        data: {
          memberCount,
          taskCount,
          docCount,
        },
      };
    } catch {
      throw new Error('获取团队统计信息失败');
    }
  }

  /**
   * 更新团队成员
   */
  static async updateTeamMember(teamId: string, memberId: string, data: any) {
    try {
      const validatedData = updateTeamMemberSchema.parse(data);

      const teamMember = await prisma.teamMember.update({
        where: {
          id: memberId,
          teamId, // 确保成员属于该团队
        },
        data: {
          responsibilities: validatedData.responsibilities,
          skills: validatedData.skills,
        },
      });

      return {
        success: true,
        data: teamMember,
        message: '团队成员更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新团队成员失败');
    }
  }

  /**
   * 删除团队成员
   */
  static async removeTeamMember(teamId: string, memberId: string) {
    try {
      await prisma.teamMember.delete({
        where: {
          id: memberId,
          teamId, // 确保成员属于该团队
        },
      });

      return {
        success: true,
        message: '团队成员删除成功',
      };
    } catch {
      throw new Error('删除团队成员失败');
    }
  }
}
