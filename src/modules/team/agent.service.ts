import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { PermissionService, Permission } from '../auth/permission.service';

@Injectable()
export class AgentService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  async create(createAgentDto: CreateAgentDto, userId: string) {
    const { teamId, ...agentData } = createAgentDto;

    // 获取团队信息以获取项目ID
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { projectId: true },
    });

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.AGENT_CREATE, team.projectId);

    const agent = await this.prisma.agent.create({
      data: {
        ...agentData,
        teamId,
        projectId: team.projectId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'AGENT_CREATE', 'AGENT', agent.id, {
      agentName: agent.name,
      teamId,
    });

    return agent;
  }

  async findByTeam(teamId: string, userId: string) {
    // 获取团队信息以检查权限
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { projectId: true },
    });

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TEAM_READ, team.projectId);

    const agents = await this.prisma.agent.findMany({
      where: { teamId },
      include: {
        _count: {
          select: {
            AgentTask: true,
            AgentActivity: true,
            AgentWorklog: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return agents;
  }

  async findOne(id: string, userId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        AgentTask: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            task: true,
          },
        },
        AgentActivity: {
          take: 20,
          orderBy: {
            createdAt: 'desc',
          },
        },
        AgentWorklog: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            AgentTask: true,
            AgentActivity: true,
            AgentWorklog: true,
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TEAM_READ, agent.projectId);

    return agent;
  }

  async update(id: string, updateAgentDto: UpdateAgentDto, userId: string) {
    const existingAgent = await this.prisma.agent.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!existingAgent) {
      throw new NotFoundException('Agent不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.AGENT_UPDATE,
      existingAgent.projectId,
    );

    const agent = await this.prisma.agent.update({
      where: { id },
      data: updateAgentDto,
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'AGENT_UPDATE', 'AGENT', id, {
      changes: updateAgentDto,
    });

    return agent;
  }

  async remove(id: string, userId: string) {
    const existingAgent = await this.prisma.agent.findUnique({
      where: { id },
      select: { projectId: true, name: true },
    });

    if (!existingAgent) {
      throw new NotFoundException('Agent不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.AGENT_DELETE,
      existingAgent.projectId,
    );

    await this.prisma.agent.delete({
      where: { id },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'AGENT_DELETE', 'AGENT', id, {
      agentName: existingAgent.name,
    });

    return { message: 'Agent删除成功' };
  }

  async getWorkLogs(agentId: string, userId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      select: { projectId: true },
    });

    if (!agent) {
      throw new NotFoundException('Agent不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TEAM_READ, agent.projectId);

    const workLogs = await this.prisma.agentWorklog.findMany({
      where: { agentId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return workLogs;
  }

  async getActivities(agentId: string, userId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      select: { projectId: true },
    });

    if (!agent) {
      throw new NotFoundException('Agent不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TEAM_READ, agent.projectId);

    const activities = await this.prisma.agentActivity.findMany({
      where: { agentId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return activities;
  }

  async getTasks(agentId: string, userId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      select: { projectId: true },
    });

    if (!agent) {
      throw new NotFoundException('Agent不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TEAM_READ, agent.projectId);

    const agentTasks = await this.prisma.agentTask.findMany({
      where: { agentId },
      include: {
        task: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return agentTasks;
  }
}
