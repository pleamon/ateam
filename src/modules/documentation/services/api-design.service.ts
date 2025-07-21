import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreateApiDesignDto, CreateApiExampleDto, ApiStatus } from '../dto/create-api-design.dto';
import { PermissionService, Permission } from '../../auth/permission.service';

@Injectable()
export class ApiDesignService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  async create(createApiDesignDto: CreateApiDesignDto, userId: string) {
    const { projectId, ...apiData } = createApiDesignDto;

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_CREATE,
      projectId,
    );

    const apiDesign = await this.prisma.apiDesign.create({
      data: {
        ...apiData,
        projectId,
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
            examples: true,
            errorCodes: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'API_DESIGN_CREATE',
      'API_DESIGN',
      apiDesign.id,
      {
        apiName: apiDesign.apiName,
        apiPath: apiDesign.apiPath,
        apiMethod: apiDesign.apiMethod,
        projectId,
      },
    );

    return apiDesign;
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
      // 只查看用户有权限的项目API
      where.project = {
        members: {
          some: {
            userId,
          },
        },
      };
    }

    // 应用过滤器
    if (filters?.platform) where.platform = filters.platform;
    if (filters?.module) where.module = filters.module;
    if (filters?.status) where.status = filters.status;
    if (filters?.apiMethod) where.apiMethod = filters.apiMethod;
    if (filters?.apiPath) {
      where.apiPath = {
        contains: filters.apiPath,
        mode: 'insensitive',
      };
    }

    const apis = await this.prisma.apiDesign.findMany({
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
            examples: true,
            errorCodes: true,
          },
        },
      },
      orderBy: [{ platform: 'asc' }, { module: 'asc' }, { apiPath: 'asc' }],
    });

    return apis;
  }

  async findOne(id: string, userId: string) {
    const apiDesign = await this.prisma.apiDesign.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        examples: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        errorCodes: {
          orderBy: {
            code: 'asc',
          },
        },
        _count: {
          select: {
            examples: true,
            errorCodes: true,
          },
        },
      },
    });

    if (!apiDesign || apiDesign.deletedAt) {
      throw new NotFoundException('API设计不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_READ,
      apiDesign.projectId,
    );

    return apiDesign;
  }

  async update(id: string, updateData: any, userId: string) {
    const existingApi = await this.prisma.apiDesign.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!existingApi) {
      throw new NotFoundException('API设计不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      existingApi.projectId,
    );

    const apiDesign = await this.prisma.apiDesign.update({
      where: { id },
      data: {
        ...updateData,
        version: {
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
            examples: true,
            errorCodes: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'API_DESIGN_UPDATE', 'API_DESIGN', id, {
      changes: updateData,
    });

    return apiDesign;
  }

  async remove(id: string, userId: string) {
    const existingApi = await this.prisma.apiDesign.findUnique({
      where: { id },
      select: { projectId: true, apiName: true, apiPath: true },
    });

    if (!existingApi) {
      throw new NotFoundException('API设计不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_DELETE,
      existingApi.projectId,
    );

    // 软删除
    await this.prisma.apiDesign.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'API_DESIGN_DELETE', 'API_DESIGN', id, {
      apiName: existingApi.apiName,
      apiPath: existingApi.apiPath,
    });

    return { message: 'API设计删除成功' };
  }

  async updateStatus(id: string, status: ApiStatus, userId: string) {
    const existingApi = await this.prisma.apiDesign.findUnique({
      where: { id },
      select: { projectId: true, status: true },
    });

    if (!existingApi) {
      throw new NotFoundException('API设计不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      existingApi.projectId,
    );

    const updateData: any = { status };

    // 如果设置为废弃或停用，记录相应日期
    if (status === ApiStatus.DEPRECATED && !existingApi.status) {
      updateData.deprecationDate = new Date();
    } else if (status === ApiStatus.RETIRED) {
      updateData.sunsetDate = new Date();
    }

    const apiDesign = await this.prisma.apiDesign.update({
      where: { id },
      data: updateData,
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'API_DESIGN_STATUS_UPDATE', 'API_DESIGN', id, {
      oldStatus: existingApi.status,
      newStatus: status,
    });

    return apiDesign;
  }

  // 示例管理
  async createExample(apiDesignId: string, createExampleDto: CreateApiExampleDto, userId: string) {
    const apiDesign = await this.prisma.apiDesign.findUnique({
      where: { id: apiDesignId },
      select: { projectId: true },
    });

    if (!apiDesign) {
      throw new NotFoundException('API设计不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      apiDesign.projectId,
    );

    const example = await this.prisma.apiExample.create({
      data: {
        ...createExampleDto,
        apiDesignId,
      },
    });

    return example;
  }

  async updateExample(exampleId: string, updateData: any, userId: string) {
    const example = await this.prisma.apiExample.findUnique({
      where: { id: exampleId },
      include: {
        apiDesign: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!example) {
      throw new NotFoundException('API示例不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      example.apiDesign.projectId,
    );

    const updatedExample = await this.prisma.apiExample.update({
      where: { id: exampleId },
      data: updateData,
    });

    return updatedExample;
  }

  async removeExample(exampleId: string, userId: string) {
    const example = await this.prisma.apiExample.findUnique({
      where: { id: exampleId },
      include: {
        apiDesign: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!example) {
      throw new NotFoundException('API示例不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      example.apiDesign.projectId,
    );

    await this.prisma.apiExample.delete({
      where: { id: exampleId },
    });

    return { message: 'API示例删除成功' };
  }

  // 错误码管理
  async createErrorCode(apiDesignId: string, createErrorCodeDto: any, userId: string) {
    const apiDesign = await this.prisma.apiDesign.findUnique({
      where: { id: apiDesignId },
      select: { projectId: true },
    });

    if (!apiDesign) {
      throw new NotFoundException('API设计不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      apiDesign.projectId,
    );

    const errorCode = await this.prisma.apiErrorCode.create({
      data: {
        ...createErrorCodeDto,
        apiDesignId,
      },
    });

    return errorCode;
  }

  async updateErrorCode(errorCodeId: string, updateData: any, userId: string) {
    const errorCode = await this.prisma.apiErrorCode.findUnique({
      where: { id: errorCodeId },
      include: {
        apiDesign: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!errorCode) {
      throw new NotFoundException('错误码不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      errorCode.apiDesign.projectId,
    );

    const updatedErrorCode = await this.prisma.apiErrorCode.update({
      where: { id: errorCodeId },
      data: updateData,
    });

    return updatedErrorCode;
  }

  async removeErrorCode(errorCodeId: string, userId: string) {
    const errorCode = await this.prisma.apiErrorCode.findUnique({
      where: { id: errorCodeId },
      include: {
        apiDesign: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!errorCode) {
      throw new NotFoundException('错误码不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      errorCode.apiDesign.projectId,
    );

    await this.prisma.apiErrorCode.delete({
      where: { id: errorCodeId },
    });

    return { message: '错误码删除成功' };
  }
}
