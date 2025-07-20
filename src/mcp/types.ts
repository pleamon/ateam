// MCP工具类型定义

export interface ProjectTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface CreateProjectArgs {
  name: string;
  description?: string;
}

export interface UpdateProjectArgs {
  projectId: string;
  name?: string;
  description?: string;
}

export interface DeleteProjectArgs {
  projectId: string;
}

export interface GetProjectArgs {
  projectId: string;
}

export interface CreateTeamArgs {
  name: string;
  description?: string;
}

export interface GetTeamArgs {
  teamId: string;
}

export interface CreateTaskArgs {
  projectId: string;
  teamId: string;
  title: string;
  content?: string;
  status?: 'todo' | 'in_progress' | 'testing' | 'done';
}

export interface UpdateTaskArgs {
  taskId: string;
  title?: string;
  content?: string;
  status?: 'todo' | 'in_progress' | 'testing' | 'done';
}

export interface GetTaskArgs {
  taskId: string;
}

export interface CreateSprintArgs {
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
}

export interface CreateDocumentationArgs {
  projectId: string;
  teamId: string;
  name: string;
  content: string;
  type?: 'overview' | 'technical' | 'design' | 'research' | 'other';
}

export interface GetStatsArgs {
  projectId?: string;
}

// MCP响应类型
export interface MCPResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

// 工具名称枚举
export enum ToolName {
  // 项目相关
  GET_PROJECTS = 'get_projects',
  GET_PROJECT = 'get_project',
  CREATE_PROJECT = 'create_project',
  UPDATE_PROJECT = 'update_project',
  DELETE_PROJECT = 'delete_project',

  // 团队相关
  GET_TEAMS = 'get_teams',
  GET_TEAM = 'get_team',
  CREATE_TEAM = 'create_team',

  // 任务相关
  GET_TASKS = 'get_tasks',
  GET_TASK = 'get_task',
  CREATE_TASK = 'create_task',
  UPDATE_TASK = 'update_task',

  // Sprint相关
  GET_SPRINTS = 'get_sprints',
  CREATE_SPRINT = 'create_sprint',

  // 文档相关
  GET_DOCUMENTATION = 'get_documentation',
  CREATE_DOCUMENTATION = 'create_documentation',

  // 统计相关
  GET_PROJECT_STATS = 'get_project_stats',
  GET_TASK_STATS = 'get_task_stats',
}
