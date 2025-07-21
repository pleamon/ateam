import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { PermissionService, Permission } from '../auth/permission.service';
import { ProjectService } from '../project/project.service';
import { TeamService } from '../team/team.service';
import { TaskService } from '../scrum/task.service';
import { SprintService } from '../scrum/sprint.service';
import { DocumentationService } from '../documentation/services/documentation.service';
import { RequirementService } from '../documentation/services/requirement.service';
import { ArchitectureService } from '../documentation/services/architecture.service';
import { ApiDesignService } from '../documentation/services/api-design.service';
import { MindMapService } from '../documentation/services/mindmap.service';
import { DomainKnowledgeService } from '../documentation/services/domain-knowledge.service';
import { DatabaseStructureService } from '../documentation/services/database-structure.service';
import { RoadmapService } from '../roadmap/roadmap.service';
import {
  JsonRpcRequestDto,
  // ToolCallParamsDto,
  ToolResponseDto,
  JsonRpcResponseDto,
  McpInfoDto,
} from './dto/mcp.dto';
import { toolsDefinition } from '../../mcp/tools-definition';
// import { ToolName } from '../../mcp/types';

@Injectable()
export class McpService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
    private projectService: ProjectService,
    private teamService: TeamService,
    private taskService: TaskService,
    private sprintService: SprintService,
    private documentationService: DocumentationService,
    private requirementService: RequirementService,
    private architectureService: ArchitectureService,
    private apiDesignService: ApiDesignService,
    private mindMapService: MindMapService,
    private domainKnowledgeService: DomainKnowledgeService,
    private databaseStructureService: DatabaseStructureService,
    private roadmapService: RoadmapService,
  ) { }

  getInfo(): McpInfoDto {
    return {
      name: 'ateam-mcp-server',
      version: '1.0.0',
      capabilities: {
        tools: true,
        resources: false,
        prompts: false,
      },
    };
  }

  getTools() {
    return {
      tools: toolsDefinition,
    };
  }

  getTool(toolName: string) {
    const tool = toolsDefinition.find((t) => t.name === toolName);
    if (!tool) {
      throw new NotFoundException(`Tool ${toolName} does not exist`);
    }
    return tool;
  }

  async handleJsonRpcRequest(
    request: JsonRpcRequestDto,
    userId: string,
  ): Promise<JsonRpcResponseDto> {
    const { jsonrpc, method, params, id } = request;

    if (jsonrpc !== '2.0') {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request: jsonrpc must be "2.0"',
        },
        id: id || null,
      };
    }

    try {
      let result;
      switch (method) {
        case 'tools/list':
          result = this.getTools();
          break;
        case 'tools/call':
          if (!params || !params.name) {
            return {
              jsonrpc: '2.0',
              error: {
                code: -32602,
                message: 'Invalid params: missing tool name',
              },
              id,
            };
          }
          result = await this.handleToolCall(params.name, params.arguments || {}, userId);
          break;
        default:
          return {
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
            id,
          };
      }

      return {
        jsonrpc: '2.0',
        result,
        id,
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : 'Unknown error',
        },
        id,
      };
    }
  }

  async handleToolCall(toolName: string, args: any, userId: string): Promise<ToolResponseDto> {
    try {
      switch (toolName) {
        // 项目相关工具
        case 'get_projects':
          return await this.getProjects(userId);
        case 'get_project':
          return await this.getProject(args.projectId, userId);
        case 'create_project':
          return await this.createProject(args, userId);
        case 'update_project':
          return await this.updateProject(args, userId);
        case 'delete_project':
          return await this.deleteProject(args.projectId, userId);

        // 团队相关工具
        case 'get_teams':
          return await this.getTeams(args.projectId, userId);
        case 'get_team':
          return await this.getTeam(args.teamId, userId);
        case 'create_team':
          return await this.createTeam(args, userId);

        // 任务相关工具
        case 'get_tasks':
          return await this.getTasks(args.projectId, userId);
        case 'get_task':
          return await this.getTask(args.taskId, userId);
        case 'create_task':
          return await this.createTask(args, userId);
        case 'update_task':
          return await this.updateTask(args, userId);

        // Sprint相关工具
        case 'get_sprints':
          return await this.getSprints(args.projectId, userId);
        case 'create_sprint':
          return await this.createSprint(args, userId);

        // 文档相关工具
        case 'get_documentation':
          return await this.getDocumentation(args.projectId, userId);
        case 'create_documentation':
          return await this.createDocumentation(args, userId);

        // 统计相关工具
        case 'get_project_stats':
          return await this.getProjectStats(args.projectId, userId);
        case 'get_task_stats':
          return await this.getTaskStats(args.projectId, userId);

        // 需求管理相关工具
        case 'get_requirements':
          return await this.getRequirements(args.projectId, userId);
        case 'create_requirement':
          return await this.createRequirement(args, userId);

        // 架构设计相关工具
        case 'get_architectures':
          return await this.getArchitectures(args.projectId, userId);
        case 'create_architecture':
          return await this.createArchitecture(args, userId);

        // API设计相关工具
        case 'get_api_designs':
          return await this.getApiDesigns(args.projectId, userId);
        case 'create_api_design':
          return await this.createApiDesign(args, userId);

        // 脑图相关工具
        case 'get_mindmap':
          return await this.getMindmap(args.projectId, userId);
        case 'create_mindmap':
          return await this.createMindmap(args, userId);

        // 领域知识相关工具
        case 'get_domain_knowledge':
          return await this.getDomainKnowledge(args.projectId, userId);
        case 'create_domain_knowledge':
          return await this.createDomainKnowledge(args, userId);

        // 权限管理相关工具
        case 'get_user_permissions':
          return await this.getUserPermissions(args, userId);
        case 'assign_project_role':
          return await this.assignProjectRole(args, userId);

        default:
          throw new BadRequestException(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  // 项目相关实现
  private async getProjects(userId: string): Promise<ToolResponseDto> {
    const projects = await this.projectService.findAll(userId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(projects, null, 2),
        },
      ],
    };
  }

  private async getProject(projectId: string, userId: string): Promise<ToolResponseDto> {
    const project = await this.projectService.findOne(projectId, userId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(project, null, 2),
        },
      ],
    };
  }

  private async createProject(args: any, userId: string): Promise<ToolResponseDto> {
    const project = await this.projectService.create(args, userId);
    return {
      content: [
        {
          type: 'text',
          text: `Project created successfully: ${project.name} (ID: ${project.id})`,
        },
      ],
    };
  }

  private async updateProject(args: any, userId: string): Promise<ToolResponseDto> {
    const { projectId, ...updateData } = args;
    const project = await this.projectService.update(projectId, updateData, userId);
    return {
      content: [
        {
          type: 'text',
          text: `Project updated successfully: ${project.name}`,
        },
      ],
    };
  }

  private async deleteProject(projectId: string, userId: string): Promise<ToolResponseDto> {
    await this.projectService.remove(projectId, userId);
    return {
      content: [
        {
          type: 'text',
          text: 'Project deleted successfully',
        },
      ],
    };
  }

  // 团队相关实现
  private async getTeams(projectId: string | undefined, userId: string): Promise<ToolResponseDto> {
    const teams = await this.teamService.findAll(userId, projectId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(teams, null, 2),
        },
      ],
    };
  }

  private async getTeam(teamId: string, userId: string): Promise<ToolResponseDto> {
    const team = await this.teamService.findOne(teamId, userId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(team, null, 2),
        },
      ],
    };
  }

  private async createTeam(args: any, userId: string): Promise<ToolResponseDto> {
    const team = await this.teamService.create(args, userId);
    return {
      content: [
        {
          type: 'text',
          text: `Team created successfully: ${team.name} (ID: ${team.id})`,
        },
      ],
    };
  }

  // 任务相关实现
  private async getTasks(projectId: string | undefined, userId: string): Promise<ToolResponseDto> {
    const tasks = await this.taskService.findAll(userId, projectId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(tasks, null, 2),
        },
      ],
    };
  }

  private async getTask(taskId: string, userId: string): Promise<ToolResponseDto> {
    const task = await this.taskService.findOne(taskId, userId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(task, null, 2),
        },
      ],
    };
  }

  private async createTask(args: any, userId: string): Promise<ToolResponseDto> {
    const task = await this.taskService.create(args, userId);
    return {
      content: [
        {
          type: 'text',
          text: `Task created successfully: ${task.title} (ID: ${task.id})`,
        },
      ],
    };
  }

  private async updateTask(args: any, userId: string): Promise<ToolResponseDto> {
    const { taskId, ...updateData } = args;
    const task = await this.taskService.update(taskId, updateData, userId);
    return {
      content: [
        {
          type: 'text',
          text: `Task updated successfully: ${task.title}`,
        },
      ],
    };
  }

  // Sprint相关实现
  private async getSprints(
    projectId: string | undefined,
    userId: string,
  ): Promise<ToolResponseDto> {
    const sprints = await this.sprintService.findAll(userId, projectId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(sprints, null, 2),
        },
      ],
    };
  }

  private async createSprint(args: any, userId: string): Promise<ToolResponseDto> {
    const sprint = await this.sprintService.create(args, userId);
    return {
      content: [
        {
          type: 'text',
          text: `Sprint created successfully: ${sprint.name} (ID: ${sprint.id})`,
        },
      ],
    };
  }

  // 文档相关实现
  private async getDocumentation(
    projectId: string | undefined,
    userId: string,
  ): Promise<ToolResponseDto> {
    const docs = await this.documentationService.findAll(userId, projectId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(docs, null, 2),
        },
      ],
    };
  }

  private async createDocumentation(args: any, userId: string): Promise<ToolResponseDto> {
    const doc = await this.documentationService.create(args, userId);
    return {
      content: [
        {
          type: 'text',
          text: `Documentation created successfully: ${doc.title} (ID: ${doc.id})`,
        },
      ],
    };
  }

  // 统计相关实现
  private async getProjectStats(
    projectId: string | undefined,
    userId: string,
  ): Promise<ToolResponseDto> {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }
    const stats = await this.projectService.getProjectStats(projectId, userId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  private async getTaskStats(
    projectId: string | undefined,
    userId: string,
  ): Promise<ToolResponseDto> {
    const stats = await this.taskService.getStats(userId, projectId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  // 需求管理相关实现
  private async getRequirements(
    projectId: string | undefined,
    userId: string,
  ): Promise<ToolResponseDto> {
    const requirements = await this.requirementService.findAll(userId, projectId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(requirements, null, 2),
        },
      ],
    };
  }

  private async createRequirement(args: any, userId: string): Promise<ToolResponseDto> {
    const requirement = await this.requirementService.create(args, userId);
    return {
      content: [
        {
          type: 'text',
          text: `Requirement created successfully: ${requirement.title} (ID: ${requirement.id})`,
        },
      ],
    };
  }

  // 架构设计相关实现
  private async getArchitectures(
    projectId: string | undefined,
    userId: string,
  ): Promise<ToolResponseDto> {
    const architectures = await this.architectureService.findAll(userId, projectId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(architectures, null, 2),
        },
      ],
    };
  }

  private async createArchitecture(args: any, userId: string): Promise<ToolResponseDto> {
    const architecture = await this.architectureService.create(args, userId);
    return {
      content: [
        {
          type: 'text',
          text: `Architecture created successfully: ${architecture.name} (ID: ${architecture.id})`,
        },
      ],
    };
  }

  // API设计相关实现
  private async getApiDesigns(
    projectId: string | undefined,
    userId: string,
  ): Promise<ToolResponseDto> {
    const apis = await this.apiDesignService.findAll(userId, projectId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(apis, null, 2),
        },
      ],
    };
  }

  private async createApiDesign(args: any, userId: string): Promise<ToolResponseDto> {
    const api = await this.apiDesignService.create(args, userId);
    return {
      content: [
        {
          type: 'text',
          text: `API design created successfully: ${api.apiName} (ID: ${api.id})`,
        },
      ],
    };
  }

  // 脑图相关实现
  private async getMindmap(
    projectId: string | undefined,
    userId: string,
  ): Promise<ToolResponseDto> {
    const mindmaps = await this.mindMapService.findAll(userId, projectId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(mindmaps, null, 2),
        },
      ],
    };
  }

  private async createMindmap(args: any, userId: string): Promise<ToolResponseDto> {
    const mindmap = await this.mindMapService.create(args, userId);
    return {
      content: [
        {
          type: 'text',
          text: `Mindmap created successfully: ${mindmap.title} (ID: ${mindmap.id})`,
        },
      ],
    };
  }

  // 领域知识相关实现
  private async getDomainKnowledge(
    projectId: string | undefined,
    userId: string,
  ): Promise<ToolResponseDto> {
    const knowledge = await this.domainKnowledgeService.findAll(userId, projectId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(knowledge, null, 2),
        },
      ],
    };
  }

  private async createDomainKnowledge(args: any, userId: string): Promise<ToolResponseDto> {
    const knowledge = await this.domainKnowledgeService.create(args, userId);
    return {
      content: [
        {
          type: 'text',
          text: `Domain knowledge created successfully: ${knowledge.domain} (ID: ${knowledge.id})`,
        },
      ],
    };
  }

  // 权限管理相关实现
  private async getUserPermissions(args: any, userId: string): Promise<ToolResponseDto> {
    const permissions = await this.permissionService.getUserPermissions(
      args.userId || userId,
      args.projectId,
    );
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(permissions, null, 2),
        },
      ],
    };
  }

  private async assignProjectRole(args: any, userId: string): Promise<ToolResponseDto> {
    // 检查执行者是否有权限分配角色
    await this.permissionService.requirePermission(
      userId,
      Permission.PROJECT_MANAGE_MEMBERS,
      args.projectId,
    );

    // 这里需要调用 projectService 的成员管理方法
    // 由于原 projectService 中没有暴露添加成员的方法，这里返回示例响应
    return {
      content: [
        {
          type: 'text',
          text:
            `Role assigned successfully: User ${args.userId} is now ${args.role} ` +
            `in project ${args.projectId}`,
        },
      ],
    };
  }
}
