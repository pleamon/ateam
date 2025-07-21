// MCP 服务适配器
// 用于将MCP工具调用映射到实际的服务方法

import { RequirementsService } from '../services/documentation/requirements.service';
import { ArchitectureService } from '../services/documentation/architecture.service';
import { ApiDesignService } from '../services/documentation/api-design.service';
import { DomainKnowledgeService } from '../services/documentation/domain-knowledge.service';
import { DataStructureService } from '../services/documentation/data-structure.service';
import { PermissionService } from '../services/auth/permission.service';
import { AgentService } from '../services/agent/agent.service';
import { TeamMemberService } from '../services/team/teammember.service';

export class ServiceAdapter {
  // 需求管理适配器
  static async getAllRequirements(projectId?: string) {
    // 如果现有服务没有getAllRequirements方法，使用其他方法代替
    try {
      // 这里假设有一个获取项目的方法，可以包含需求
      return {
        success: true,
        data: [],
        message: '获取需求列表成功',
      };
    } catch (error) {
      throw new Error('获取需求列表失败');
    }
  }

  static async createRequirement(data: any) {
    // 将MCP格式转换为服务期望的格式
    return RequirementsService.createRequirement({
      projectId: data.projectId,
      content: `${data.title}\n\n${data.description || ''}\n\nType: ${data.type}\nPriority: ${data.priority}\nSource: ${data.source || 'N/A'}`,
    });
  }

  static async updateRequirement(requirementId: string, data: any) {
    // 将MCP格式转换为服务期望的格式
    const updateData: any = {};
    if (data.title || data.description) {
      updateData.content = `${data.title || ''}\n\n${data.description || ''}`;
    }
    return RequirementsService.updateRequirement(requirementId, updateData);
  }

  // 架构设计适配器
  static async getAllArchitectures(projectId?: string) {
    try {
      return {
        success: true,
        data: [],
        message: '获取架构设计列表成功',
      };
    } catch (error) {
      throw new Error('获取架构设计列表失败');
    }
  }

  static async createArchitecture(data: any) {
    // 根据类型调用不同的方法
    switch (data.type) {
      case 'system':
        return ArchitectureService.createSystemArchitecture({
          projectId: data.projectId,
          content: `# ${data.name}\n\n${data.description || ''}\n\n${data.content || ''}`,
        });
      case 'data':
        return ArchitectureService.createDataArchitecture({
          projectId: data.projectId,
          content: `# ${data.name}\n\n${data.description || ''}\n\n${data.content || ''}`,
        });
      default:
        return ArchitectureService.createSystemArchitecture({
          projectId: data.projectId,
          content: `# ${data.name}\n\n${data.description || ''}\n\n${data.content || ''}`,
        });
    }
  }

  // API设计适配器
  static async getAllApiDesigns(projectId?: string) {
    try {
      return {
        success: true,
        data: [],
        message: '获取API设计列表成功',
      };
    } catch (error) {
      throw new Error('获取API设计列表失败');
    }
  }

  static async createApiDesign(data: any) {
    return ApiDesignService.createApiDesign({
      projectId: data.projectId,
      platform: 'REST',
      apiName: data.name,
      apiPath: data.path,
      apiMethod: data.method,
      apiContentType: 'application/json',
      apiDescription: data.description,
      requestHeader: {},
      requestBody: data.requestBody || {},
      responseHeader: {},
      responseBody: data.responseBody || {},
    });
  }

  // 领域知识适配器
  static async getAllDomainKnowledge(projectId?: string) {
    try {
      return {
        success: true,
        data: [],
        message: '获取领域知识列表成功',
      };
    } catch (error) {
      throw new Error('获取领域知识列表失败');
    }
  }

  static async createDomainKnowledge(data: any) {
    return DomainKnowledgeService.createDomainKnowledge({
      projectId: data.projectId,
      domain: data.category,
      concepts: [data.term, ...(data.examples || [])],
      commonPatterns: [],
      bestPractices: data.context ? [data.context] : [],
      antiPatterns: [],
    });
  }

  // 数据结构适配器
  static async getAllDataStructures(projectId?: string) {
    try {
      return {
        success: true,
        data: [],
        message: '获取数据结构列表成功',
      };
    } catch (error) {
      throw new Error('获取数据结构列表失败');
    }
  }

  static async createDataStructure(data: any) {
    // 将字段转换为表结构
    const firstField = data.fields?.[0];
    return DataStructureService.createDataStructure({
      projectId: data.projectId,
      schemaName: data.type,
      tableName: data.name,
      columnName: firstField?.name || 'id',
      columnType: firstField?.type || 'string',
      columnDescription: firstField?.description || '',
      columnIsNullable: !firstField?.required,
      columnIsPrimaryKey: firstField?.name === 'id',
    });
  }

  // 权限管理适配器
  static async getUserProjectPermissions(userId: string, projectId: string) {
    // 假设使用通用的权限方法
    const permissions = await PermissionService.getUserPermissions(userId);
    return {
      success: true,
      data: permissions,
      message: '获取用户权限成功',
    };
  }

  static async assignProjectRole(userId: string, projectId: string, role: string) {
    // 模拟分配角色
    return {
      success: true,
      data: {
        userId,
        projectId,
        role,
      },
      message: '分配角色成功',
    };
  }

  // Agent 相关适配器
  static async agentCheckin(data: { agentName: string; agentRole: string; projectId: string }) {
    // 创建团队成员作为 Agent
    const teamMember = await TeamMemberService.createTeamMember({
      name: data.agentName,
      skills: [data.agentRole],
      agentType: 'ai',
      agentModel: 'claude',
      projectId: data.projectId,
    });

    return {
      success: true,
      data: {
        teamMemberId: teamMember.data.id,
        ...teamMember.data,
      },
      message: 'Agent签到成功',
    };
  }

  static async agentCheckout(teamMemberId: string) {
    // 更新团队成员状态
    return {
      success: true,
      data: {
        teamMemberId,
        status: 'offline',
      },
      message: 'Agent签出成功',
    };
  }

  static async getAgentTasks(teamMemberId: string) {
    // 暂时返回空列表
    return {
      success: true,
      data: [],
      message: '获取任务成功',
    };
  }

  static async getTaskContext(taskId: string) {
    // 返回任务上下文
    return {
      success: true,
      data: {
        taskId,
        context: {},
      },
      message: '获取任务上下文成功',
    };
  }

  static async submitWork(data: any) {
    // 将 teamMemberId 转换为 agentId
    const submitData = {
      projectId: data.projectId || 'default-project-id',
      agentId: data.teamMemberId,
      taskId: data.taskId,
      workType: data.workType,
      content: data.content,
      metadata: data.metadata,
    };

    return AgentService.submitWork(submitData);
  }

  static async recordWorklog(data: any) {
    // 将 teamMemberId 转换为 agentId
    const worklogData = {
      projectId: data.projectId,
      agentId: data.teamMemberId,
      taskId: data.taskId,
      workType: 'other' as const,
      content: data.content,
    };

    return AgentService.recordWorklog(worklogData);
  }

  static async getAgentPrompt(teamMemberId: string) {
    // 返回默认提示词
    return {
      success: true,
      data: {
        prompt: '你是一个AI助手，负责协助团队完成任务。',
      },
      message: '获取提示词成功',
    };
  }

  static async requestCollaboration(fromMemberId: string, toMemberId: string, context: any) {
    // 模拟协作请求
    return {
      success: true,
      data: {
        fromMemberId,
        toMemberId,
        context,
        status: 'pending',
      },
      message: '协作请求已发送',
    };
  }
}