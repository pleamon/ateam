import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRole, ProjectRole } from '@generated/prisma';
import { PrismaService } from '@shared/prisma/prisma.service';

export enum Permission {
  // 项目权限
  PROJECT_CREATE = 'project.create',
  PROJECT_READ = 'project.read',
  PROJECT_UPDATE = 'project.update',
  PROJECT_DELETE = 'project.delete',
  PROJECT_MEMBERS_MANAGE = 'project.members.manage',
  PROJECT_MANAGE_MEMBERS = 'project.members.manage', // 别名，保持向后兼容

  // 团队权限
  TEAM_CREATE = 'team.create',
  TEAM_READ = 'team.read',
  TEAM_UPDATE = 'team.update',
  TEAM_DELETE = 'team.delete',
  TEAM_MEMBERS_MANAGE = 'team.members.manage',

  // 任务权限
  TASK_CREATE = 'task.create',
  TASK_READ = 'task.read',
  TASK_UPDATE = 'task.update',
  TASK_DELETE = 'task.delete',
  TASK_ASSIGN = 'task.assign',

  // 文档权限
  DOCUMENTATION_CREATE = 'documentation.create',
  DOCUMENTATION_READ = 'documentation.read',
  DOCUMENTATION_UPDATE = 'documentation.update',
  DOCUMENTATION_DELETE = 'documentation.delete',

  // AI Agent权限
  AGENT_EXECUTE = 'agent.execute',
  AGENT_CREATE = 'agent.create',
  AGENT_UPDATE = 'agent.update',
  AGENT_DELETE = 'agent.delete',

  // 系统权限
  SYSTEM_ADMIN = 'system.admin',
  SYSTEM_USER_MANAGE = 'system.user.manage',
}

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) { }

  // 系统级权限映射
  private readonly systemPermissions: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: Object.values(Permission),
    [UserRole.USER]: [
      Permission.PROJECT_CREATE,
      Permission.PROJECT_READ,
      Permission.TEAM_READ,
      Permission.TASK_READ,
      Permission.DOCUMENTATION_READ,
      Permission.AGENT_EXECUTE,
    ],
    [UserRole.GUEST]: [
      Permission.PROJECT_READ,
      Permission.TEAM_READ,
      Permission.TASK_READ,
      Permission.DOCUMENTATION_READ,
    ],
  };

  // 项目级权限映射
  private readonly projectPermissions: Record<ProjectRole, Permission[]> = {
    [ProjectRole.OWNER]: [
      Permission.PROJECT_READ,
      Permission.PROJECT_UPDATE,
      Permission.PROJECT_DELETE,
      Permission.PROJECT_MEMBERS_MANAGE,
      Permission.TEAM_CREATE,
      Permission.TEAM_READ,
      Permission.TEAM_UPDATE,
      Permission.TEAM_DELETE,
      Permission.TEAM_MEMBERS_MANAGE,
      Permission.TASK_CREATE,
      Permission.TASK_READ,
      Permission.TASK_UPDATE,
      Permission.TASK_DELETE,
      Permission.TASK_ASSIGN,
      Permission.DOCUMENTATION_CREATE,
      Permission.DOCUMENTATION_READ,
      Permission.DOCUMENTATION_UPDATE,
      Permission.DOCUMENTATION_DELETE,
      Permission.AGENT_EXECUTE,
      Permission.AGENT_CREATE,
      Permission.AGENT_UPDATE,
      Permission.AGENT_DELETE,
    ],
    [ProjectRole.ADMIN]: [
      Permission.PROJECT_READ,
      Permission.PROJECT_UPDATE,
      Permission.PROJECT_MEMBERS_MANAGE,
      Permission.TEAM_CREATE,
      Permission.TEAM_READ,
      Permission.TEAM_UPDATE,
      Permission.TEAM_DELETE,
      Permission.TEAM_MEMBERS_MANAGE,
      Permission.TASK_CREATE,
      Permission.TASK_READ,
      Permission.TASK_UPDATE,
      Permission.TASK_DELETE,
      Permission.TASK_ASSIGN,
      Permission.DOCUMENTATION_CREATE,
      Permission.DOCUMENTATION_READ,
      Permission.DOCUMENTATION_UPDATE,
      Permission.DOCUMENTATION_DELETE,
      Permission.AGENT_EXECUTE,
      Permission.AGENT_CREATE,
      Permission.AGENT_UPDATE,
    ],
    [ProjectRole.MEMBER]: [
      Permission.PROJECT_READ,
      Permission.TEAM_READ,
      Permission.TASK_CREATE,
      Permission.TASK_READ,
      Permission.TASK_UPDATE,
      Permission.DOCUMENTATION_CREATE,
      Permission.DOCUMENTATION_READ,
      Permission.DOCUMENTATION_UPDATE,
      Permission.AGENT_EXECUTE,
    ],
    [ProjectRole.VIEWER]: [
      Permission.PROJECT_READ,
      Permission.TEAM_READ,
      Permission.TASK_READ,
      Permission.DOCUMENTATION_READ,
    ],
  };

  async getUserPermissions(userId: string, projectId?: string): Promise<Permission[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        projectMembers: projectId
          ? {
            where: { projectId },
          }
          : true,
      },
    });

    if (!user) {
      throw new ForbiddenException('用户不存在');
    }

    // 获取系统级权限
    const systemPerms = this.systemPermissions[user.role] || [];

    if (!projectId) {
      return systemPerms;
    }

    // 获取项目级权限
    const projectMember = user.projectMembers.find((pm) => pm.projectId === projectId);
    if (!projectMember) {
      return systemPerms;
    }

    const projectPerms = this.projectPermissions[projectMember.role] || [];

    // 合并权限（去重）
    return [...new Set([...systemPerms, ...projectPerms])];
  }

  async checkPermission(
    userId: string,
    permission: Permission,
    projectId?: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, projectId);
    return permissions.includes(permission);
  }

  async requirePermission(
    userId: string,
    permission: Permission,
    projectId?: string,
  ): Promise<void> {
    const hasPermission = await this.checkPermission(userId, permission, projectId);
    if (!hasPermission) {
      throw new ForbiddenException('没有权限执行此操作');
    }
  }

  async logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details?: any,
  ): Promise<void> {
    await this.prisma.auditLog.create({
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
