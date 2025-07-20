import { PrismaClient, UserRole, ProjectRole } from '../../../generated/prisma';

const prisma = new PrismaClient();

// 权限定义
export enum Permission {
  // 项目权限
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_MANAGE_MEMBERS = 'project:manage_members',

  // 团队权限
  TEAM_CREATE = 'team:create',
  TEAM_READ = 'team:read',
  TEAM_UPDATE = 'team:update',
  TEAM_DELETE = 'team:delete',

  // 任务权限
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',

  // 文档权限
  DOC_CREATE = 'doc:create',
  DOC_READ = 'doc:read',
  DOC_UPDATE = 'doc:update',
  DOC_DELETE = 'doc:delete',

  // AI Agent 权限
  AGENT_EXECUTE = 'agent:execute',
  AGENT_MANAGE = 'agent:manage',

  // 系统权限
  SYSTEM_MANAGE = 'system:manage',
  USER_MANAGE = 'user:manage',
}

// 角色权限映射
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: Object.values(Permission), // 管理员拥有所有权限
  USER: [
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.TEAM_READ,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.DOC_CREATE,
    Permission.DOC_READ,
    Permission.DOC_UPDATE,
    Permission.AGENT_EXECUTE,
  ],
  GUEST: [Permission.PROJECT_READ, Permission.TEAM_READ, Permission.TASK_READ, Permission.DOC_READ],
};

// 项目角色权限映射
const PROJECT_ROLE_PERMISSIONS: Record<ProjectRole, Permission[]> = {
  OWNER: [
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_MANAGE_MEMBERS,
    Permission.TEAM_CREATE,
    Permission.TEAM_READ,
    Permission.TEAM_UPDATE,
    Permission.TEAM_DELETE,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.DOC_CREATE,
    Permission.DOC_READ,
    Permission.DOC_UPDATE,
    Permission.DOC_DELETE,
    Permission.AGENT_EXECUTE,
    Permission.AGENT_MANAGE,
  ],
  ADMIN: [
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_MANAGE_MEMBERS,
    Permission.TEAM_CREATE,
    Permission.TEAM_READ,
    Permission.TEAM_UPDATE,
    Permission.TEAM_DELETE,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.DOC_CREATE,
    Permission.DOC_READ,
    Permission.DOC_UPDATE,
    Permission.DOC_DELETE,
    Permission.AGENT_EXECUTE,
    Permission.AGENT_MANAGE,
  ],
  MEMBER: [
    Permission.PROJECT_READ,
    Permission.TEAM_READ,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.DOC_CREATE,
    Permission.DOC_READ,
    Permission.DOC_UPDATE,
    Permission.AGENT_EXECUTE,
  ],
  VIEWER: [
    Permission.PROJECT_READ,
    Permission.TEAM_READ,
    Permission.TASK_READ,
    Permission.DOC_READ,
  ],
};

export class PermissionService {
  /**
   * 检查用户是否有指定权限
   */
  static async checkPermission(
    userId: string,
    permission: Permission,
    projectId?: string,
  ): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        return false;
      }

      // 系统级权限检查
      const userPermissions = ROLE_PERMISSIONS[user.role];
      if (userPermissions.includes(permission)) {
        return true;
      }

      // 项目级权限检查
      if (projectId) {
        const projectMember = await prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId,
            },
          },
        });

        if (projectMember) {
          // 检查项目角色权限
          const projectPermissions = PROJECT_ROLE_PERMISSIONS[projectMember.role];
          if (projectPermissions.includes(permission)) {
            return true;
          }

          // 检查自定义权限
          if (projectMember.permissions.includes(permission)) {
            return true;
          }
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * 获取用户在项目中的角色
   */
  static async getUserProjectRole(userId: string, projectId: string): Promise<ProjectRole | null> {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return member?.role || null;
  }

  /**
   * 检查用户是否是项目成员
   */
  static async isProjectMember(userId: string, projectId: string): Promise<boolean> {
    const member = await prisma.projectMember.count({
      where: {
        projectId,
        userId,
      },
    });

    return member > 0;
  }

  /**
   * 获取用户的所有权限
   */
  static async getUserPermissions(userId: string, projectId?: string): Promise<Permission[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return [];
    }

    const permissions = new Set(ROLE_PERMISSIONS[user.role]);

    if (projectId) {
      const projectMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      });

      if (projectMember) {
        // 添加项目角色权限
        PROJECT_ROLE_PERMISSIONS[projectMember.role].forEach((p) => permissions.add(p));
        // 添加自定义权限
        projectMember.permissions.forEach((p) => permissions.add(p as Permission));
      }
    }

    return Array.from(permissions);
  }

  /**
   * 记录审计日志
   */
  static async createAuditLog(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: any,
  ) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details,
      },
    });
  }
}
