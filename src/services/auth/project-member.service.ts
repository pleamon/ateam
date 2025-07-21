import { PrismaClient, ProjectRole } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// 请求验证schema
const createProjectMemberSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  userId: z.string().min(1, '用户ID不能为空'),
  role: z.nativeEnum(ProjectRole).default(ProjectRole.MEMBER),
  permissions: z.array(z.string()).default([]),
});

const updateProjectMemberSchema = z.object({
  role: z.nativeEnum(ProjectRole).optional(),
  permissions: z.array(z.string()).optional(),
});

const batchAddMembersSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  members: z.array(
    z.object({
      userId: z.string().min(1, '用户ID不能为空'),
      role: z.nativeEnum(ProjectRole).default(ProjectRole.MEMBER),
      permissions: z.array(z.string()).default([]),
    })
  ),
});

export class ProjectMemberService {
  /**
   * 获取项目成员列表
   */
  static async getProjectMembers(projectId: string) {
    try {
      const members = await prisma.projectMember.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              name: true,
              avatar: true,
              role: true,
              isActive: true,
            },
          },
          project: true,
        },
        orderBy: {
          joinedAt: 'desc',
        },
      });

      return {
        success: true,
        data: members,
      };
    } catch {
      throw new Error('获取项目成员列表失败');
    }
  }

  /**
   * 获取用户的项目列表
   */
  static async getUserProjects(userId: string) {
    try {
      const memberships = await prisma.projectMember.findMany({
        where: { userId },
        include: {
          project: true,
        },
        orderBy: {
          joinedAt: 'desc',
        },
      });

      return {
        success: true,
        data: memberships,
      };
    } catch {
      throw new Error('获取用户项目列表失败');
    }
  }

  /**
   * 获取项目成员详情
   */
  static async getProjectMember(projectId: string, userId: string) {
    try {
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
          project: true,
        },
      });

      if (!member) {
        throw new Error('项目成员不存在');
      }

      return {
        success: true,
        data: member,
      };
    } catch {
      throw new Error('获取项目成员详情失败');
    }
  }

  /**
   * 添加项目成员
   */
  static async addProjectMember(data: z.infer<typeof createProjectMemberSchema>) {
    try {
      const validatedData = createProjectMemberSchema.parse(data);

      // 检查用户是否已是项目成员
      const existingMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: validatedData.projectId,
            userId: validatedData.userId,
          },
        },
      });

      if (existingMember) {
        throw new Error('用户已是项目成员');
      }

      // 检查项目是否存在
      const project = await prisma.project.findUnique({
        where: { id: validatedData.projectId },
      });

      if (!project) {
        throw new Error('项目不存在');
      }

      // 检查用户是否存在
      const user = await prisma.user.findUnique({
        where: { id: validatedData.userId },
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      const member = await prisma.projectMember.create({
        data: {
          projectId: validatedData.projectId,
          userId: validatedData.userId,
          role: validatedData.role,
          permissions: validatedData.permissions,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          project: true,
        },
      });

      return {
        success: true,
        data: member,
        message: '项目成员添加成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw error;
    }
  }

  /**
   * 批量添加项目成员
   */
  static async batchAddMembers(data: z.infer<typeof batchAddMembersSchema>) {
    try {
      const validatedData = batchAddMembersSchema.parse(data);

      // 检查项目是否存在
      const project = await prisma.project.findUnique({
        where: { id: validatedData.projectId },
      });

      if (!project) {
        throw new Error('项目不存在');
      }

      // 获取现有成员
      const existingMembers = await prisma.projectMember.findMany({
        where: { projectId: validatedData.projectId },
        select: { userId: true },
      });

      const existingUserIds = new Set(existingMembers.map((m) => m.userId));

      // 过滤出新成员
      const newMembers = validatedData.members.filter(
        (member) => !existingUserIds.has(member.userId)
      );

      if (newMembers.length === 0) {
        throw new Error('所有用户都已是项目成员');
      }

      // 批量创建
      const createdMembers = await prisma.projectMember.createMany({
        data: newMembers.map((member) => ({
          projectId: validatedData.projectId,
          userId: member.userId,
          role: member.role,
          permissions: member.permissions,
        })),
      });

      return {
        success: true,
        data: {
          count: createdMembers.count,
          skipped: validatedData.members.length - newMembers.length,
        },
        message: `成功添加 ${createdMembers.count} 个成员`,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw error;
    }
  }

  /**
   * 更新项目成员
   */
  static async updateProjectMember(
    projectId: string,
    userId: string,
    data: z.infer<typeof updateProjectMemberSchema>
  ) {
    try {
      const validatedData = updateProjectMemberSchema.parse(data);

      const member = await prisma.projectMember.update({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
        data: {
          role: validatedData.role,
          permissions: validatedData.permissions,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      return {
        success: true,
        data: member,
        message: '项目成员更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新项目成员失败');
    }
  }

  /**
   * 移除项目成员
   */
  static async removeProjectMember(projectId: string, userId: string) {
    try {
      // 检查是否为项目所有者
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      });

      if (!member) {
        throw new Error('项目成员不存在');
      }

      if (member.role === ProjectRole.OWNER) {
        // 检查是否还有其他所有者
        const ownerCount = await prisma.projectMember.count({
          where: {
            projectId,
            role: ProjectRole.OWNER,
          },
        });

        if (ownerCount === 1) {
          throw new Error('不能移除最后一个项目所有者');
        }
      }

      await prisma.projectMember.delete({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      });

      return {
        success: true,
        message: '项目成员移除成功',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 转让项目所有权
   */
  static async transferOwnership(projectId: string, fromUserId: string, toUserId: string) {
    try {
      // 检查当前用户是否为所有者
      const currentOwner = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: fromUserId,
          },
        },
      });

      if (!currentOwner || currentOwner.role !== ProjectRole.OWNER) {
        throw new Error('只有项目所有者才能转让所有权');
      }

      // 检查目标用户是否为项目成员
      const targetMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: toUserId,
          },
        },
      });

      if (!targetMember) {
        throw new Error('目标用户不是项目成员');
      }

      // 使用事务更新
      const [updatedFrom, updatedTo] = await prisma.$transaction([
        // 将当前所有者改为管理员
        prisma.projectMember.update({
          where: {
            projectId_userId: {
              projectId,
              userId: fromUserId,
            },
          },
          data: {
            role: ProjectRole.ADMIN,
          },
        }),
        // 将目标用户改为所有者
        prisma.projectMember.update({
          where: {
            projectId_userId: {
              projectId,
              userId: toUserId,
            },
          },
          data: {
            role: ProjectRole.OWNER,
          },
        }),
      ]);

      return {
        success: true,
        data: {
          from: updatedFrom,
          to: updatedTo,
        },
        message: '项目所有权转让成功',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 检查用户权限
   */
  static async checkPermission(projectId: string, userId: string, permission: string) {
    try {
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      });

      if (!member) {
        return {
          success: false,
          hasPermission: false,
          message: '用户不是项目成员',
        };
      }

      // 所有者拥有所有权限
      if (member.role === ProjectRole.OWNER) {
        return {
          success: true,
          hasPermission: true,
        };
      }

      // 检查具体权限
      const hasPermission = member.permissions.includes(permission);

      return {
        success: true,
        hasPermission,
      };
    } catch {
      throw new Error('检查权限失败');
    }
  }

  /**
   * 获取项目成员统计
   */
  static async getProjectMemberStats(projectId: string) {
    try {
      const [total, owners, admins, members, viewers] = await Promise.all([
        prisma.projectMember.count({ where: { projectId } }),
        prisma.projectMember.count({
          where: { projectId, role: ProjectRole.OWNER },
        }),
        prisma.projectMember.count({
          where: { projectId, role: ProjectRole.ADMIN },
        }),
        prisma.projectMember.count({
          where: { projectId, role: ProjectRole.MEMBER },
        }),
        prisma.projectMember.count({
          where: { projectId, role: ProjectRole.VIEWER },
        }),
      ]);

      return {
        success: true,
        data: {
          total,
          byRole: {
            owners,
            admins,
            members,
            viewers,
          },
        },
      };
    } catch {
      throw new Error('获取项目成员统计失败');
    }
  }
}