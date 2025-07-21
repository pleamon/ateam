import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import {
  CreateRoadmapDto,
  CreateMilestoneDto,
  CreateVersionDto,
  CreateFeatureDto,
  RoadmapStatus,
  MilestoneStatus,
  VersionStatus,
  FeatureStatus,
} from './dto/create-roadmap.dto';
import {
  UpdateRoadmapDto,
  UpdateMilestoneDto,
  UpdateVersionDto,
  UpdateFeatureDto,
} from './dto/update-roadmap.dto';
import { PermissionService, Permission } from '../auth/permission.service';

@Injectable()
export class RoadmapService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  // Roadmap 管理
  async createRoadmap(createRoadmapDto: CreateRoadmapDto, userId: string) {
    const { projectId, ...roadmapData } = createRoadmapDto;

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TASK_CREATE, projectId);

    const roadmap = await this.prisma.roadmap.create({
      data: {
        ...roadmapData,
        projectId,
        status: roadmapData.status || RoadmapStatus.PLANNING,
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
            milestones: true,
            versions: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'ROADMAP_CREATE', 'ROADMAP', roadmap.id, {
      name: roadmap.name,
      projectId,
    });

    return roadmap;
  }

  async findAllRoadmaps(userId: string, projectId?: string) {
    const where: any = {};

    if (projectId) {
      // 检查用户权限
      await this.permissionService.requirePermission(userId, Permission.TASK_READ, projectId);
      where.projectId = projectId;
    } else {
      // 只查看用户有权限的项目路线图
      where.project = {
        members: {
          some: {
            userId,
          },
        },
      };
    }

    const roadmaps = await this.prisma.roadmap.findMany({
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
            milestones: true,
            versions: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return roadmaps;
  }

  async findOneRoadmap(id: string, userId: string) {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        milestones: {
          include: {
            _count: {
              select: {
                features: true,
              },
            },
          },
          orderBy: {
            targetDate: 'asc',
          },
        },
        versions: {
          include: {
            _count: {
              select: {
                features: true,
              },
            },
          },
          orderBy: {
            releaseDate: 'asc',
          },
        },
        _count: {
          select: {
            milestones: true,
            versions: true,
          },
        },
      },
    });

    if (!roadmap) {
      throw new NotFoundException('路线图不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TASK_READ, roadmap.projectId);

    return roadmap;
  }

  async updateRoadmap(id: string, updateRoadmapDto: UpdateRoadmapDto, userId: string) {
    const existingRoadmap = await this.prisma.roadmap.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!existingRoadmap) {
      throw new NotFoundException('路线图不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TASK_UPDATE,
      existingRoadmap.projectId,
    );

    const roadmap = await this.prisma.roadmap.update({
      where: { id },
      data: updateRoadmapDto,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            milestones: true,
            versions: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'ROADMAP_UPDATE', 'ROADMAP', id, {
      changes: updateRoadmapDto,
    });

    return roadmap;
  }

  async removeRoadmap(id: string, userId: string) {
    const existingRoadmap = await this.prisma.roadmap.findUnique({
      where: { id },
      select: { projectId: true, name: true },
    });

    if (!existingRoadmap) {
      throw new NotFoundException('路线图不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TASK_DELETE,
      existingRoadmap.projectId,
    );

    await this.prisma.roadmap.delete({
      where: { id },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'ROADMAP_DELETE', 'ROADMAP', id, {
      name: existingRoadmap.name,
    });

    return { message: '路线图删除成功' };
  }

  // Milestone 管理
  async createMilestone(createMilestoneDto: CreateMilestoneDto, userId: string) {
    const { roadmapId, ...milestoneData } = createMilestoneDto;

    // 获取路线图信息
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapId },
      select: { projectId: true },
    });

    if (!roadmap) {
      throw new NotFoundException('路线图不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TASK_CREATE,
      roadmap.projectId,
    );

    const milestone = await this.prisma.milestone.create({
      data: {
        ...milestoneData,
        roadmapId,
        status: milestoneData.status || MilestoneStatus.PLANNED,
        priority: milestoneData.priority || 'medium',
      },
      include: {
        roadmap: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            features: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'MILESTONE_CREATE', 'MILESTONE', milestone.id, {
      name: milestone.name,
      roadmapId,
    });

    return milestone;
  }

  async findAllMilestones(userId: string, projectId?: string) {
    const where: any = {};

    if (projectId) {
      // 检查用户权限
      await this.permissionService.requirePermission(userId, Permission.TASK_READ, projectId);
      where.roadmap = {
        projectId,
      };
    } else {
      // 只查看用户有权限的项目里程碑
      where.roadmap = {
        project: {
          members: {
            some: {
              userId,
            },
          },
        },
      };
    }

    const milestones = await this.prisma.milestone.findMany({
      where,
      include: {
        roadmap: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            features: true,
          },
        },
      },
      orderBy: {
        targetDate: 'asc',
      },
    });

    return milestones;
  }

  async updateMilestone(id: string, updateMilestoneDto: UpdateMilestoneDto, userId: string) {
    const existingMilestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: {
        roadmap: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!existingMilestone) {
      throw new NotFoundException('里程碑不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TASK_UPDATE,
      existingMilestone.roadmap.projectId,
    );

    const milestone = await this.prisma.milestone.update({
      where: { id },
      data: updateMilestoneDto,
      include: {
        roadmap: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            features: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'MILESTONE_UPDATE', 'MILESTONE', id, {
      changes: updateMilestoneDto,
    });

    return milestone;
  }

  async removeMilestone(id: string, userId: string) {
    const existingMilestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: {
        roadmap: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!existingMilestone) {
      throw new NotFoundException('里程碑不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TASK_DELETE,
      existingMilestone.roadmap.projectId,
    );

    await this.prisma.milestone.delete({
      where: { id },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'MILESTONE_DELETE', 'MILESTONE', id, {
      name: existingMilestone.name,
    });

    return { message: '里程碑删除成功' };
  }

  // Version 管理
  async createVersion(createVersionDto: CreateVersionDto, userId: string) {
    const { roadmapId, ...versionData } = createVersionDto;

    // 获取路线图信息
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapId },
      select: { projectId: true },
    });

    if (!roadmap) {
      throw new NotFoundException('路线图不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TASK_CREATE,
      roadmap.projectId,
    );

    const version = await this.prisma.version.create({
      data: {
        ...versionData,
        roadmapId,
        status: versionData.status || VersionStatus.PLANNED,
      },
      include: {
        roadmap: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            features: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'VERSION_CREATE', 'VERSION', version.id, {
      name: version.name,
      roadmapId,
    });

    return version;
  }

  async findAllVersions(userId: string, projectId?: string) {
    const where: any = {};

    if (projectId) {
      // 检查用户权限
      await this.permissionService.requirePermission(userId, Permission.TASK_READ, projectId);
      where.roadmap = {
        projectId,
      };
    } else {
      // 只查看用户有权限的项目版本
      where.roadmap = {
        project: {
          members: {
            some: {
              userId,
            },
          },
        },
      };
    }

    const versions = await this.prisma.version.findMany({
      where,
      include: {
        roadmap: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            features: true,
          },
        },
      },
      orderBy: {
        releaseDate: 'asc',
      },
    });

    return versions;
  }

  async updateVersion(id: string, updateVersionDto: UpdateVersionDto, userId: string) {
    const existingVersion = await this.prisma.version.findUnique({
      where: { id },
      include: {
        roadmap: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!existingVersion) {
      throw new NotFoundException('版本不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TASK_UPDATE,
      existingVersion.roadmap.projectId,
    );

    const version = await this.prisma.version.update({
      where: { id },
      data: updateVersionDto,
      include: {
        roadmap: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            features: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'VERSION_UPDATE', 'VERSION', id, {
      changes: updateVersionDto,
    });

    return version;
  }

  async removeVersion(id: string, userId: string) {
    const existingVersion = await this.prisma.version.findUnique({
      where: { id },
      include: {
        roadmap: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!existingVersion) {
      throw new NotFoundException('版本不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TASK_DELETE,
      existingVersion.roadmap.projectId,
    );

    await this.prisma.version.delete({
      where: { id },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'VERSION_DELETE', 'VERSION', id, {
      name: existingVersion.name,
    });

    return { message: '版本删除成功' };
  }

  // Feature 管理
  async createFeature(createFeatureDto: CreateFeatureDto, userId: string) {
    // 验证至少提供了 milestoneId 或 versionId
    if (!createFeatureDto.milestoneId && !createFeatureDto.versionId) {
      throw new Error('功能必须关联到里程碑或版本');
    }

    let projectId: string;

    // 获取项目ID
    if (createFeatureDto.milestoneId) {
      const milestone = await this.prisma.milestone.findUnique({
        where: { id: createFeatureDto.milestoneId },
        include: {
          roadmap: {
            select: {
              projectId: true,
            },
          },
        },
      });

      if (!milestone) {
        throw new NotFoundException('里程碑不存在');
      }
      projectId = milestone.roadmap.projectId;
    } else if (createFeatureDto.versionId) {
      const version = await this.prisma.version.findUnique({
        where: { id: createFeatureDto.versionId },
        include: {
          roadmap: {
            select: {
              projectId: true,
            },
          },
        },
      });

      if (!version) {
        throw new NotFoundException('版本不存在');
      }
      projectId = version.roadmap.projectId;
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TASK_CREATE, projectId);

    const feature = await this.prisma.feature.create({
      data: {
        ...createFeatureDto,
        status: createFeatureDto.status || FeatureStatus.PLANNED,
        priority: createFeatureDto.priority || 'medium',
      },
      include: {
        milestone: {
          select: {
            id: true,
            name: true,
          },
        },
        version: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'FEATURE_CREATE', 'FEATURE', feature.id, {
      name: feature.name,
      milestoneId: feature.milestoneId,
      versionId: feature.versionId,
    });

    return feature;
  }

  async updateFeature(id: string, updateFeatureDto: UpdateFeatureDto, userId: string) {
    const existingFeature = await this.prisma.feature.findUnique({
      where: { id },
      include: {
        milestone: {
          include: {
            roadmap: {
              select: {
                projectId: true,
              },
            },
          },
        },
        version: {
          include: {
            roadmap: {
              select: {
                projectId: true,
              },
            },
          },
        },
      },
    });

    if (!existingFeature) {
      throw new NotFoundException('功能不存在');
    }

    const projectId =
      existingFeature.milestone?.roadmap.projectId || existingFeature.version?.roadmap.projectId;

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TASK_UPDATE, projectId);

    const feature = await this.prisma.feature.update({
      where: { id },
      data: updateFeatureDto,
      include: {
        milestone: {
          select: {
            id: true,
            name: true,
          },
        },
        version: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'FEATURE_UPDATE', 'FEATURE', id, {
      changes: updateFeatureDto,
    });

    return feature;
  }

  async removeFeature(id: string, userId: string) {
    const existingFeature = await this.prisma.feature.findUnique({
      where: { id },
      include: {
        milestone: {
          include: {
            roadmap: {
              select: {
                projectId: true,
              },
            },
          },
        },
        version: {
          include: {
            roadmap: {
              select: {
                projectId: true,
              },
            },
          },
        },
      },
    });

    if (!existingFeature) {
      throw new NotFoundException('功能不存在');
    }

    const projectId =
      existingFeature.milestone?.roadmap.projectId || existingFeature.version?.roadmap.projectId;

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TASK_DELETE, projectId);

    await this.prisma.feature.delete({
      where: { id },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'FEATURE_DELETE', 'FEATURE', id, {
      name: existingFeature.name,
    });

    return { message: '功能删除成功' };
  }

  // 统计信息
  async getRoadmapStats(projectId: string, userId: string) {
    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TASK_READ, projectId);

    const [
      totalRoadmaps,
      totalMilestones,
      totalVersions,
      totalFeatures,
      milestonesByStatus,
      featuresByStatus,
      versionsByStatus,
    ] = await Promise.all([
      this.prisma.roadmap.count({ where: { projectId } }),
      this.prisma.milestone.count({ where: { roadmap: { projectId } } }),
      this.prisma.version.count({ where: { roadmap: { projectId } } }),
      this.prisma.feature.count({
        where: {
          OR: [{ milestone: { roadmap: { projectId } } }, { version: { roadmap: { projectId } } }],
        },
      }),
      this.prisma.milestone.groupBy({
        by: ['status'],
        where: { roadmap: { projectId } },
        _count: true,
      }),
      this.prisma.feature.groupBy({
        by: ['status'],
        where: {
          OR: [{ milestone: { roadmap: { projectId } } }, { version: { roadmap: { projectId } } }],
        },
        _count: true,
      }),
      this.prisma.version.groupBy({
        by: ['status'],
        where: { roadmap: { projectId } },
        _count: true,
      }),
    ]);

    // 格式化状态统计
    const formatStatusCount = (data: any[], statusEnum: any) => {
      const result: Record<string, number> = {};
      Object.values(statusEnum).forEach((status) => {
        result[status as string] = 0;
      });
      data.forEach((item) => {
        if (item.status && typeof item.status === 'string') {
          result[item.status] = item._count;
        }
      });
      return result;
    };

    return {
      totalRoadmaps,
      totalMilestones,
      totalVersions,
      totalFeatures,
      milestonesByStatus: formatStatusCount(milestonesByStatus, MilestoneStatus),
      featuresByStatus: formatStatusCount(featuresByStatus, FeatureStatus),
      versionsByStatus: formatStatusCount(versionsByStatus, VersionStatus),
    };
  }
}
