import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ProjectService } from '../services/project.service.js';
import { TeamService } from '../services/team/team.service.js';
import { TaskService } from '../services/task.service.js';
import { SprintService } from '../services/sprint.service.js';
import { DocumentationService } from '../services/documentation/index.js';
import { DashboardService } from '../services/dashboard.service.js';
import { RoadmapService } from '../services/roadmap.service.js';

class ATeamMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: 'ateam-mcp-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();
    }

    private setupToolHandlers() {
        // 项目相关工具
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'get_projects',
                        description: '获取所有项目列表',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'get_project',
                        description: '根据ID获取项目详情',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: '项目ID',
                                },
                            },
                            required: ['projectId'],
                        },
                    },
                    {
                        name: 'create_project',
                        description: '创建新项目',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: '项目名称',
                                },
                                description: {
                                    type: 'string',
                                    description: '项目描述',
                                },
                            },
                            required: ['name'],
                        },
                    },
                    {
                        name: 'update_project',
                        description: '更新项目信息',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: '项目ID',
                                },
                                name: {
                                    type: 'string',
                                    description: '项目名称',
                                },
                                description: {
                                    type: 'string',
                                    description: '项目描述',
                                },
                            },
                            required: ['projectId'],
                        },
                    },
                    {
                        name: 'delete_project',
                        description: '删除项目',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: '项目ID',
                                },
                            },
                            required: ['projectId'],
                        },
                    },
                    // 团队相关工具
                    {
                        name: 'get_teams',
                        description: '获取所有团队列表',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'get_team',
                        description: '根据ID获取团队详情',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                teamId: {
                                    type: 'string',
                                    description: '团队ID',
                                },
                            },
                            required: ['teamId'],
                        },
                    },
                    {
                        name: 'create_team',
                        description: '创建新团队',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: '团队名称',
                                },
                                description: {
                                    type: 'string',
                                    description: '团队描述',
                                },
                            },
                            required: ['name'],
                        },
                    },
                    // 任务相关工具
                    {
                        name: 'get_tasks',
                        description: '获取所有任务列表',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'get_task',
                        description: '根据ID获取任务详情',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                taskId: {
                                    type: 'string',
                                    description: '任务ID',
                                },
                            },
                            required: ['taskId'],
                        },
                    },
                    {
                        name: 'create_task',
                        description: '创建新任务',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: '项目ID',
                                },
                                teamId: {
                                    type: 'string',
                                    description: '团队ID',
                                },
                                title: {
                                    type: 'string',
                                    description: '任务标题',
                                },
                                content: {
                                    type: 'string',
                                    description: '任务内容',
                                },
                                status: {
                                    type: 'string',
                                    enum: ['todo', 'in_progress', 'testing', 'done'],
                                    description: '任务状态',
                                },
                            },
                            required: ['projectId', 'teamId', 'title'],
                        },
                    },
                    {
                        name: 'update_task',
                        description: '更新任务信息',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                taskId: {
                                    type: 'string',
                                    description: '任务ID',
                                },
                                title: {
                                    type: 'string',
                                    description: '任务标题',
                                },
                                content: {
                                    type: 'string',
                                    description: '任务内容',
                                },
                                status: {
                                    type: 'string',
                                    enum: ['todo', 'in_progress', 'testing', 'done'],
                                    description: '任务状态',
                                },
                            },
                            required: ['taskId'],
                        },
                    },
                    // Sprint相关工具
                    {
                        name: 'get_sprints',
                        description: '获取所有Sprint列表',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'create_sprint',
                        description: '创建新Sprint',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: '项目ID',
                                },
                                name: {
                                    type: 'string',
                                    description: 'Sprint名称',
                                },
                                startDate: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: '开始日期',
                                },
                                endDate: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: '结束日期',
                                },
                                goal: {
                                    type: 'string',
                                    description: 'Sprint目标',
                                },
                            },
                            required: ['projectId', 'name', 'startDate', 'endDate', 'goal'],
                        },
                    },
                    // 文档相关工具
                    {
                        name: 'get_documentation',
                        description: '获取所有文档列表',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'create_documentation',
                        description: '创建新文档',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: '项目ID',
                                },
                                teamId: {
                                    type: 'string',
                                    description: '团队ID',
                                },
                                name: {
                                    type: 'string',
                                    description: '文档名称',
                                },
                                content: {
                                    type: 'string',
                                    description: '文档内容',
                                },
                                type: {
                                    type: 'string',
                                    enum: ['overview', 'technical', 'design', 'research', 'other'],
                                    description: '文档类型',
                                },
                            },
                            required: ['projectId', 'teamId', 'name', 'content'],
                        },
                    },
                    // 统计工具
                    {
                        name: 'get_project_stats',
                        description: '获取项目统计信息',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: '项目ID',
                                },
                            },
                            required: ['projectId'],
                        },
                    },
                    {
                        name: 'get_task_stats',
                        description: '获取任务统计信息',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: '项目ID（可选）',
                                },
                            },
                        },
                    },
                    // Dashboard工具
                    {
                        name: 'get_dashboard_stats',
                        description: '获取仪表盘统计数据，包括项目、团队、任务、Sprint和文档的统计信息',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'get_project_dashboard',
                        description: '获取特定项目的仪表盘数据，包括项目详情、任务统计、Sprint统计和文档统计',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: '项目ID',
                                },
                            },
                            required: ['projectId'],
                        },
                    },
                    // Roadmap工具
                    {
                        name: 'get_project_roadmaps',
                        description: '获取项目的所有路线图',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: '项目ID',
                                },
                            },
                            required: ['projectId'],
                        },
                    },
                    {
                        name: 'get_roadmap',
                        description: '根据ID获取路线图详情',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                roadmapId: {
                                    type: 'string',
                                    description: '路线图ID',
                                },
                            },
                            required: ['roadmapId'],
                        },
                    },
                    {
                        name: 'create_roadmap',
                        description: '创建新路线图',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: '项目ID',
                                },
                                name: {
                                    type: 'string',
                                    description: '路线图名称',
                                },
                                description: {
                                    type: 'string',
                                    description: '路线图描述',
                                },
                                startDate: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: '开始日期',
                                },
                                endDate: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: '结束日期',
                                },
                                status: {
                                    type: 'string',
                                    enum: ['planning', 'active', 'completed', 'cancelled'],
                                    description: '状态',
                                },
                            },
                            required: ['projectId', 'name', 'startDate', 'endDate'],
                        },
                    },
                    {
                        name: 'create_milestone',
                        description: '创建新里程碑',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                roadmapId: {
                                    type: 'string',
                                    description: '路线图ID',
                                },
                                name: {
                                    type: 'string',
                                    description: '里程碑名称',
                                },
                                description: {
                                    type: 'string',
                                    description: '里程碑描述',
                                },
                                targetDate: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: '目标日期',
                                },
                                status: {
                                    type: 'string',
                                    enum: ['planned', 'in_progress', 'completed', 'delayed'],
                                    description: '状态',
                                },
                                priority: {
                                    type: 'string',
                                    enum: ['low', 'medium', 'high', 'critical'],
                                    description: '优先级',
                                },
                            },
                            required: ['roadmapId', 'name', 'targetDate'],
                        },
                    },
                    {
                        name: 'create_version',
                        description: '创建新版本',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                roadmapId: {
                                    type: 'string',
                                    description: '路线图ID',
                                },
                                name: {
                                    type: 'string',
                                    description: '版本名称',
                                },
                                description: {
                                    type: 'string',
                                    description: '版本描述',
                                },
                                releaseDate: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: '发布日期',
                                },
                                status: {
                                    type: 'string',
                                    enum: ['planned', 'in_development', 'testing', 'released', 'deprecated'],
                                    description: '状态',
                                },
                            },
                            required: ['roadmapId', 'name'],
                        },
                    },
                    {
                        name: 'create_feature',
                        description: '创建新功能',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                milestoneId: {
                                    type: 'string',
                                    description: '里程碑ID（可选）',
                                },
                                versionId: {
                                    type: 'string',
                                    description: '版本ID（可选）',
                                },
                                name: {
                                    type: 'string',
                                    description: '功能名称',
                                },
                                description: {
                                    type: 'string',
                                    description: '功能描述',
                                },
                                status: {
                                    type: 'string',
                                    enum: ['planned', 'in_development', 'testing', 'completed', 'cancelled'],
                                    description: '状态',
                                },
                                priority: {
                                    type: 'string',
                                    enum: ['low', 'medium', 'high', 'critical'],
                                    description: '优先级',
                                },
                                effort: {
                                    type: 'string',
                                    description: '工作量估算',
                                },
                            },
                            required: ['name'],
                        },
                    },
                ],
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

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
                        const { projectId, name: projectName, description } = args as {
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
                        const { projectId, name, startDate, endDate, goal } = args as {
                            projectId: string;
                            name: string;
                            startDate: string;
                            endDate: string;
                            goal: string;
                        };
                        const result = await SprintService.createSprint({
                            projectId,
                            name,
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
                        const { projectId, teamId, name, content, type } = args as {
                            projectId: string;
                            teamId: string;
                            name: string;
                            content: string;
                            type?: string;
                        };
                        const result = await DocumentationService.createDocumentation({
                            projectId,
                            teamId,
                            name,
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
                        const { projectId, name, description, startDate, endDate, status } = args as {
                            projectId: string;
                            name: string;
                            description?: string;
                            startDate: string;
                            endDate: string;
                            status?: string;
                        };
                        const result = await RoadmapService.createRoadmap({
                            projectId,
                            name,
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
                        const { roadmapId, name, description, targetDate, status, priority } = args as {
                            roadmapId: string;
                            name: string;
                            description?: string;
                            targetDate: string;
                            status?: string;
                            priority?: string;
                        };
                        const result = await RoadmapService.createMilestone({
                            roadmapId,
                            name,
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
                        const { roadmapId, name, description, releaseDate, status } = args as {
                            roadmapId: string;
                            name: string;
                            description?: string;
                            releaseDate?: string;
                            status?: string;
                        };
                        const result = await RoadmapService.createVersion({
                            roadmapId,
                            name,
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
                        const { milestoneId, versionId, name, description, status, priority, effort } = args as {
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
                            name,
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
        });
    }

    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.log('MCP Server started');
    }
}

export { ATeamMCPServer }; 