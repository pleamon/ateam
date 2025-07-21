import { ProjectService } from '../services/scrum/project.service';
import { TeamService } from '../services/team/team.service';
import { TaskService } from '../services/scrum/task.service';
import { SprintService } from '../services/scrum/sprint.service';
import { DocumentationService } from '../services/documentation/index';
import { DashboardService } from '../services/dashboard.service';
import { RoadmapService } from '../services/roadmap/roadmap.service';
import { AgentService } from '../services/agent/agent.service';
import { RequirementsService } from '../services/documentation/requirements.service';
import { ArchitectureService } from '../services/documentation/architecture.service';
import { ApiDesignService } from '../services/documentation/api-design.service';
import { MindMapService } from '../services/documentation/mindmap.service';
import { DomainKnowledgeService } from '../services/documentation/domain-knowledge.service';
import { DataStructureService } from '../services/documentation/data-structure.service';
import { PermissionService } from '../services/auth/permission.service';
import { ServiceAdapter } from './service-adapter';

export class ToolHandler {
  static async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        // 项目相关工具
        case 'get_projects': {
          const result = await ProjectService.getAllProjects();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_project': {
          const { projectId } = args as { projectId: string };
          const result = await ProjectService.getProjectById(projectId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_project': {
          const { name: projectName, description } = args as {
            name: string;
            description?: string;
          };
          const result = await ProjectService.createProject({
            name: projectName,
            description,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'update_project': {
          const {
            projectId,
            name: projectName,
            description,
          } = args as {
            projectId: string;
            name?: string;
            description?: string;
          };
          const result = await ProjectService.updateProject(projectId, {
            name: projectName,
            description,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'delete_project': {
          const { projectId } = args as { projectId: string };
          const result = await ProjectService.deleteProject(projectId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 团队相关工具
        case 'get_teams': {
          const result = await TeamService.getAllTeams();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_team': {
          const { teamId } = args as { teamId: string };
          const result = await TeamService.getTeamById(teamId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_team': {
          const { name: teamName, description } = args as {
            name: string;
            description?: string;
          };
          const result = await TeamService.createTeam({
            name: teamName,
            description,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 任务相关工具
        case 'get_tasks': {
          const result = await TaskService.getAllTasks();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_task': {
          const { taskId } = args as { taskId: string };
          const result = await TaskService.getTaskById(taskId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_task': {
          const { projectId, teamId, title, content, status } = args as {
            projectId: string;
            teamId: string;
            title: string;
            content?: string;
            status?: string;
          };
          const result = await TaskService.createTask({
            projectId,
            teamId,
            title,
            content,
            status: status as any,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'update_task': {
          const { taskId, title, content, status } = args as {
            taskId: string;
            title?: string;
            content?: string;
            status?: string;
          };
          const result = await TaskService.updateTask(taskId, {
            title,
            content,
            status: status as any,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // Sprint相关工具
        case 'get_sprints': {
          const result = await SprintService.getAllSprints();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_sprint': {
          const {
            projectId,
            name: sprintName,
            startDate,
            endDate,
            goal,
          } = args as {
            projectId: string;
            name: string;
            startDate: string;
            endDate: string;
            goal: string;
          };
          const result = await SprintService.createSprint({
            projectId,
            name: sprintName,
            startDate,
            endDate,
            goal,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 文档相关工具
        case 'get_documentation': {
          const result = await DocumentationService.getAllDocumentation();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_documentation': {
          const {
            projectId,
            teamId,
            name: documentTitle,
            content,
            type,
          } = args as {
            projectId: string;
            teamId: string;
            name: string;
            content: string;
            type?: string;
          };
          const result = await DocumentationService.createDocumentation({
            projectId,
            teamId,
            name: documentTitle,
            content,
            type: type as any,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 统计工具
        case 'get_project_stats': {
          const { projectId } = args as { projectId: string };
          const result = await ProjectService.getProjectStats(projectId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_task_stats': {
          const { projectId } = args as { projectId?: string };
          const result = await TaskService.getTaskStats(projectId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // Dashboard工具
        case 'get_dashboard_stats': {
          const result = await DashboardService.getDashboardStats();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_project_dashboard': {
          const { projectId } = args as { projectId: string };
          const result = await DashboardService.getProjectDashboard(projectId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // Roadmap工具
        case 'get_project_roadmaps': {
          const { projectId } = args as { projectId: string };
          const result = await RoadmapService.getProjectRoadmaps(projectId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_roadmap': {
          const { roadmapId } = args as { roadmapId: string };
          const result = await RoadmapService.getRoadmapById(roadmapId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_roadmap': {
          const {
            projectId,
            name: roadmapTitle,
            description,
            startDate,
            endDate,
            status,
          } = args as {
            projectId: string;
            name: string;
            description?: string;
            startDate: string;
            endDate: string;
            status?: string;
          };
          const result = await RoadmapService.createRoadmap({
            projectId,
            name: roadmapTitle,
            description,
            startDate,
            endDate,
            status: status as any,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_milestone': {
          const {
            roadmapId,
            name: milestoneTitle,
            description,
            targetDate,
            status,
            priority,
          } = args as {
            roadmapId: string;
            name: string;
            description?: string;
            targetDate: string;
            status?: string;
            priority?: string;
          };
          const result = await RoadmapService.createMilestone({
            roadmapId,
            name: milestoneTitle,
            description,
            targetDate,
            status: status as any,
            priority: priority as any,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_version': {
          const {
            roadmapId,
            name: versionName,
            description,
            releaseDate,
            status,
          } = args as {
            roadmapId: string;
            name: string;
            description?: string;
            releaseDate?: string;
            status?: string;
          };
          const result = await RoadmapService.createVersion({
            roadmapId,
            name: versionName,
            description,
            releaseDate,
            status: status as any,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_feature': {
          const {
            milestoneId,
            versionId,
            name: featureName,
            description,
            status,
            priority,
            effort,
          } = args as {
            milestoneId?: string;
            versionId?: string;
            name: string;
            description?: string;
            status?: string;
            priority?: string;
            effort?: string;
          };
          const result = await RoadmapService.createFeature({
            milestoneId,
            versionId,
            name: featureName,
            description,
            status: status as any,
            priority: priority as any,
            effort,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // Agent 工作流工具
        case 'agent_checkin': {
          const { agentName, agentRole, projectId } = args as {
            agentName: string;
            agentRole: string;
            projectId: string;
          };
          const result = await ServiceAdapter.agentCheckin({
            agentName,
            agentRole,
            projectId,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'agent_checkout': {
          const { teamMemberId } = args as { teamMemberId: string };
          const result = await ServiceAdapter.agentCheckout(teamMemberId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_agent_tasks': {
          const { teamMemberId } = args as { teamMemberId: string };
          const result = await ServiceAdapter.getAgentTasks(teamMemberId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_task_context': {
          const { taskId } = args as { taskId: string };
          const result = await ServiceAdapter.getTaskContext(taskId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'submit_work': {
          const { teamMemberId, taskId, workType, content, metadata } = args as {
            teamMemberId: string;
            taskId?: string;
            workType: 'documentation' | 'architecture' | 'code' | 'test' | 'other';
            content: string;
            metadata?: any;
          };
          const result = await ServiceAdapter.submitWork({
            teamMemberId,
            taskId,
            workType,
            content,
            metadata,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'record_worklog': {
          const { teamMemberId, taskId, content, projectId } = args as {
            teamMemberId: string;
            taskId?: string;
            content: string;
            projectId: string;
          };
          const result = await ServiceAdapter.recordWorklog({
            teamMemberId,
            taskId,
            content,
            projectId,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_agent_prompt': {
          const { teamMemberId } = args as { teamMemberId: string };
          const result = await ServiceAdapter.getAgentPrompt(teamMemberId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'request_collaboration': {
          const { fromMemberId, toMemberId, context } = args as {
            fromMemberId: string;
            toMemberId: string;
            context: any;
          };
          const result = await ServiceAdapter.requestCollaboration(fromMemberId, toMemberId, context);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 需求管理工具
        case 'get_requirements': {
          const { projectId } = args as { projectId?: string };
          const result = await ServiceAdapter.getAllRequirements(projectId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_requirement': {
          const { requirementId } = args as { requirementId: string };
          const result = await RequirementsService.getRequirementById(requirementId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_requirement': {
          const { projectId, title, description, type, priority, source } = args as {
            projectId: string;
            title: string;
            description?: string;
            type: string;
            priority: string;
            source?: string;
          };
          const result = await ServiceAdapter.createRequirement({
            projectId,
            title,
            description,
            type,
            priority,
            source,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'update_requirement': {
          const { requirementId, title, description, status, priority } = args as {
            requirementId: string;
            title?: string;
            description?: string;
            status?: string;
            priority?: string;
          };
          const result = await ServiceAdapter.updateRequirement(requirementId, {
            title,
            description,
            status,
            priority,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 架构设计工具
        case 'get_architectures': {
          const { projectId } = args as { projectId?: string };
          const result = await ServiceAdapter.getAllArchitectures(projectId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_architecture': {
          const { projectId, name, type, description, content } = args as {
            projectId: string;
            name: string;
            type: string;
            description?: string;
            content?: string;
          };
          const result = await ServiceAdapter.createArchitecture({
            projectId,
            name,
            type,
            description,
            content,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // API设计工具
        case 'get_api_designs': {
          const { projectId } = args as { projectId?: string };
          const result = await ServiceAdapter.getAllApiDesigns(projectId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_api_design': {
          const { projectId, name, method, path, description, requestBody, responseBody } = args as {
            projectId: string;
            name: string;
            method: string;
            path: string;
            description?: string;
            requestBody?: any;
            responseBody?: any;
          };
          const result = await ServiceAdapter.createApiDesign({
            projectId,
            name,
            method,
            path,
            description,
            requestBody,
            responseBody,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 脑图工具
        case 'get_mindmap': {
          const { projectId } = args as { projectId: string };
          const result = await MindMapService.getProjectMindMap(projectId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_mindmap': {
          const { projectId, content, nodes } = args as {
            projectId: string;
            content?: string;
            nodes?: any[];
          };
          const result = await MindMapService.createMindMap({
            projectId,
            content,
            nodes,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 领域知识管理工具
        case 'get_domain_knowledge': {
          const { projectId } = args as { projectId?: string };
          const result = await ServiceAdapter.getAllDomainKnowledge(projectId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_domain_knowledge': {
          const { projectId, term, category, definition, context, examples } = args as {
            projectId: string;
            term: string;
            category: string;
            definition: string;
            context?: string;
            examples?: string[];
          };
          const result = await ServiceAdapter.createDomainKnowledge({
            projectId,
            term,
            category,
            definition,
            context,
            examples,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 数据结构设计工具
        case 'get_data_structures': {
          const { projectId } = args as { projectId?: string };
          const result = await ServiceAdapter.getAllDataStructures(projectId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_data_structure': {
          const { projectId, name, type, fields } = args as {
            projectId: string;
            name: string;
            type: string;
            fields?: any[];
          };
          const result = await ServiceAdapter.createDataStructure({
            projectId,
            name,
            type,
            fields,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 权限管理工具
        case 'get_user_permissions': {
          const { userId, projectId } = args as { userId: string; projectId: string };
          const result = await ServiceAdapter.getUserProjectPermissions(userId, projectId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'assign_project_role': {
          const { userId, projectId, role } = args as {
            userId: string;
            projectId: string;
            role: string;
          };
          const result = await ServiceAdapter.assignProjectRole(userId, projectId, role);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
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
}
