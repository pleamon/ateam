import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import {
  CreateSystemArchitectureDto,
  CreatePlatformArchitectureDto,
  ArchitectureStatus,
} from './dto/create-architecture.dto';
import { PermissionService, Permission } from '../auth/permission.service';

@Injectable()
export class ArchitectureService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  async create(createArchitectureDto: CreateSystemArchitectureDto, userId: string) {
    const { projectId, ...architectureData } = createArchitectureDto;

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_CREATE,
      projectId,
    );

    const architecture = await this.prisma.systemArchitecture.create({
      data: {
        name: architectureData.name,
        overview: architectureData.overview,
        version: architectureData.version || '1.0.0',
        status: architectureData.status,
        platforms: architectureData.platforms,
        components: architectureData.components,
        technologies: architectureData.technologies,
        diagrams: architectureData.diagrams,
        notes: architectureData.notes,
        project: { connect: { id: projectId } },
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
            platformArchitectures: true,
            changeHistories: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'ARCHITECTURE_CREATE',
      'ARCHITECTURE',
      architecture.id,
      { name: architecture.name, projectId },
    );

    return architecture;
  }

  async findAll(userId: string, projectId?: string, filters?: any) {
    const where: any = { deletedAt: null };

    if (projectId) {
      // 检查用户权限
      await this.permissionService.requirePermission(
        userId,
        Permission.DOCUMENTATION_READ,
        projectId,
      );
      where.projectId = projectId;
    } else {
      // 只查看用户有权限的项目架构
      where.project = {
        members: {
          some: {
            userId,
          },
        },
      };
    }

    // 应用过滤器
    if (filters?.status) where.status = filters.status;
    if (filters?.version) where.version = filters.version;

    const architectures = await this.prisma.systemArchitecture.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            platformArchitectures: true,
            changeHistories: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    });

    return architectures;
  }

  async findOne(id: string, userId: string) {
    const architecture = await this.prisma.systemArchitecture.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        platformArchitectures: {
          orderBy: {
            platform: 'asc',
          },
        },
        changeHistories: {
          include: {
            User: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            changedAt: 'desc',
          },
          take: 10,
        },
        previousVersion: {
          select: {
            id: true,
            version: true,
            name: true,
          },
        },
        _count: {
          select: {
            platformArchitectures: true,
            changeHistories: true,
          },
        },
      },
    });

    if (!architecture || architecture.deletedAt) {
      throw new NotFoundException('架构不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_READ,
      architecture.projectId,
    );

    return architecture;
  }

  async update(id: string, updateData: any, userId: string) {
    const existingArchitecture = await this.prisma.systemArchitecture.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!existingArchitecture) {
      throw new NotFoundException('架构不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      existingArchitecture.projectId,
    );

    // 记录变更历史
    await this.prisma.architectureChangeHistory.create({
      data: {
        architectureId: id,
        changeType: '修改',
        changeDescription: '更新架构信息',
        changeReason: '架构优化',
        userId,
      },
    });

    const architecture = await this.prisma.systemArchitecture.update({
      where: { id },
      data: {
        ...updateData,
        versionNumber: {
          increment: 1,
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
            platformArchitectures: true,
            changeHistories: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'ARCHITECTURE_UPDATE', 'ARCHITECTURE', id, {
      changes: updateData,
    });

    return architecture;
  }

  async remove(id: string, userId: string) {
    const existingArchitecture = await this.prisma.systemArchitecture.findUnique({
      where: { id },
      select: { projectId: true, name: true },
    });

    if (!existingArchitecture) {
      throw new NotFoundException('架构不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_DELETE,
      existingArchitecture.projectId,
    );

    // 软删除
    await this.prisma.systemArchitecture.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'ARCHITECTURE_DELETE', 'ARCHITECTURE', id, {
      name: existingArchitecture.name,
    });

    return { message: '架构删除成功' };
  }

  async updateStatus(id: string, status: ArchitectureStatus, userId: string) {
    const existingArchitecture = await this.prisma.systemArchitecture.findUnique({
      where: { id },
      select: { projectId: true, status: true },
    });

    if (!existingArchitecture) {
      throw new NotFoundException('架构不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      existingArchitecture.projectId,
    );

    // 记录变更历史
    await this.prisma.architectureChangeHistory.create({
      data: {
        architectureId: id,
        changeType: '状态变更',
        changeDescription: `架构状态从 ${existingArchitecture.status} 变更为 ${status}`,
        changeReason: '架构评审',
        userId,
      },
    });

    const architecture = await this.prisma.systemArchitecture.update({
      where: { id },
      data: { status },
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'ARCHITECTURE_STATUS_UPDATE',
      'ARCHITECTURE',
      id,
      { oldStatus: existingArchitecture.status, newStatus: status },
    );

    return architecture;
  }

  // 平台架构管理
  async createPlatformArchitecture(
    systemArchitectureId: string,
    createPlatformDto: CreatePlatformArchitectureDto,
    userId: string,
  ) {
    const systemArchitecture = await this.prisma.systemArchitecture.findUnique({
      where: { id: systemArchitectureId },
      select: { projectId: true },
    });

    if (!systemArchitecture) {
      throw new NotFoundException('系统架构不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      systemArchitecture.projectId,
    );

    const platformArchitecture = await this.prisma.platformArchitecture.create({
      data: {
        ...createPlatformDto,
        systemArchitectureId,
      },
    });

    // 记录变更历史
    await this.prisma.architectureChangeHistory.create({
      data: {
        architectureId: systemArchitectureId,
        changeType: '新增',
        changeDescription: `新增平台架构: ${createPlatformDto.platform}`,
        changeReason: '架构扩展',
        userId,
      },
    });

    return platformArchitecture;
  }

  async updatePlatformArchitecture(platformId: string, updateData: any, userId: string) {
    const platform = await this.prisma.platformArchitecture.findUnique({
      where: { id: platformId },
      include: {
        systemArchitecture: {
          select: {
            id: true,
            projectId: true,
          },
        },
      },
    });

    if (!platform) {
      throw new NotFoundException('平台架构不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      platform.systemArchitecture.projectId,
    );

    const updatedPlatform = await this.prisma.platformArchitecture.update({
      where: { id: platformId },
      data: updateData,
    });

    // 记录变更历史
    await this.prisma.architectureChangeHistory.create({
      data: {
        architectureId: platform.systemArchitectureId,
        changeType: '修改',
        changeDescription: `更新平台架构: ${platform.platform}`,
        changeReason: '架构优化',
        userId,
      },
    });

    return updatedPlatform;
  }

  async removePlatformArchitecture(platformId: string, userId: string) {
    const platform = await this.prisma.platformArchitecture.findUnique({
      where: { id: platformId },
      include: {
        systemArchitecture: {
          select: {
            id: true,
            projectId: true,
          },
        },
      },
    });

    if (!platform) {
      throw new NotFoundException('平台架构不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      platform.systemArchitecture.projectId,
    );

    await this.prisma.platformArchitecture.delete({
      where: { id: platformId },
    });

    // 记录变更历史
    await this.prisma.architectureChangeHistory.create({
      data: {
        architectureId: platform.systemArchitectureId,
        changeType: '删除',
        changeDescription: `删除平台架构: ${platform.platform}`,
        changeReason: '架构调整',
        userId,
      },
    });

    return { message: '平台架构删除成功' };
  }
}
