import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectRole } from '@generated/prisma';
import { PermissionService, Permission } from '../auth/permission.service';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        createdBy: userId,
        members: {
          create: {
            userId,
            role: ProjectRole.OWNER,
            permissions: [],
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        members: true,
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'PROJECT_CREATE', 'PROJECT', project.id, {
      projectName: project.name,
    });

    return project;
  }

  async findAll(userId: string) {
    // 获取用户参与的所有项目
    const projects = await this.prisma.project.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            Sprint: true,
            documentation: true,
            Requirement: true,
            team: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects;
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
              },
            },
          },
        },
        tasks: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        Sprint: {
          take: 5,
          orderBy: { startDate: 'desc' },
        },
        documentation: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            tasks: true,
            Sprint: true,
            documentation: true,
            Requirement: true,
            team: true,
            members: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('项目不存在');
    }

    // 检查用户是否有权限查看该项目
    await this.permissionService.requirePermission(userId, Permission.PROJECT_READ, id);

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    // 检查项目是否存在
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundException('项目不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.PROJECT_UPDATE, id);

    const project = await this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        members: true,
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'PROJECT_UPDATE', 'PROJECT', id, {
      changes: updateProjectDto,
    });

    return project;
  }

  async remove(id: string, userId: string) {
    // 检查项目是否存在
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundException('项目不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.PROJECT_DELETE, id);

    await this.prisma.project.delete({
      where: { id },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'PROJECT_DELETE', 'PROJECT', id, {
      projectName: existingProject.name,
    });

    return { message: '项目删除成功' };
  }

  async getStats(id: string, userId: string) {
    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.PROJECT_READ, id);

    const stats = await this.prisma.project.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            tasks: true,
            Sprint: true,
            documentation: true,
            Requirement: true,
            team: true,
            members: true,
          },
        },
      },
    });

    if (!stats) {
      throw new NotFoundException('项目不存在');
    }

    return {
      totalTasks: stats._count.tasks,
      totalSprints: stats._count.Sprint,
      totalDocuments: stats._count.documentation,
      totalRequirements: stats._count.Requirement,
      totalTeams: stats._count.team,
      totalMembers: stats._count.members,
    };
  }

  async getProjectStats(projectId: string, userId: string) {
    // 使用已有的 getStats 方法
    return this.getStats(projectId, userId);
  }
}
