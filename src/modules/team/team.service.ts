import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PermissionService, Permission } from '../auth/permission.service';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  async create(createTeamDto: CreateTeamDto, userId: string) {
    const { name, description, projectId } = createTeamDto;

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TEAM_CREATE, projectId);

    const team = await this.prisma.team.create({
      data: {
        name,
        description,
        projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'TEAM_CREATE', 'TEAM', team.id, {
      teamName: team.name,
      projectId,
    });

    return team;
  }

  async findAll(userId: string, projectId?: string) {
    // 如果指定了项目ID，检查权限
    if (projectId) {
      await this.permissionService.requirePermission(userId, Permission.TEAM_READ, projectId);
    }

    const teams = await this.prisma.team.findMany({
      where: projectId
        ? { projectId }
        : {
          project: {
            members: {
              some: {
                userId,
              },
            },
          },
        },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            agents: true,
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return teams;
  }

  async findOne(id: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        agents: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        tasks: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            agents: true,
            tasks: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TEAM_READ, team.projectId);

    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto, userId: string) {
    const existingTeam = await this.prisma.team.findUnique({
      where: { id },
    });

    if (!existingTeam) {
      throw new NotFoundException('团队不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TEAM_UPDATE,
      existingTeam.projectId,
    );

    const team = await this.prisma.team.update({
      where: { id },
      data: updateTeamDto,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'TEAM_UPDATE', 'TEAM', id, {
      changes: updateTeamDto,
    });

    return team;
  }

  async remove(id: string, userId: string) {
    const existingTeam = await this.prisma.team.findUnique({
      where: { id },
    });

    if (!existingTeam) {
      throw new NotFoundException('团队不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TEAM_DELETE,
      existingTeam.projectId,
    );

    await this.prisma.team.delete({
      where: { id },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'TEAM_DELETE', 'TEAM', id, {
      teamName: existingTeam.name,
    });

    return { message: '团队删除成功' };
  }

  async getStats(id: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      select: {
        projectId: true,
        _count: {
          select: {
            agents: true,
            tasks: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TEAM_READ, team.projectId);

    // 获取工作日志和活动统计
    const [workLogsCount, activitiesCount] = await Promise.all([
      this.prisma.agentWorklog.count({
        where: {
          agent: {
            teamId: id,
          },
        },
      }),
      this.prisma.agentActivity.count({
        where: {
          agent: {
            teamId: id,
          },
        },
      }),
    ]);

    return {
      totalAgents: team._count.agents,
      totalTasks: team._count.tasks,
      totalWorkLogs: workLogsCount,
      totalActivities: activitiesCount,
    };
  }
}
