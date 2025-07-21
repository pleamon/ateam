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

// 需求管理相关
export interface CreateRequirementArgs {
  projectId: string;
  title: string;
  description?: string;
  type: 'functional' | 'non_functional' | 'business' | 'technical' | 'constraint';
  priority: 'critical' | 'high' | 'medium' | 'low';
  source?: 'client' | 'internal' | 'market' | 'regulatory' | 'technical';
}

export interface UpdateRequirementArgs {
  requirementId: string;
  title?: string;
  description?: string;
  status?:
    | 'draft'
    | 'reviewing'
    | 'approved'
    | 'implementing'
    | 'testing'
    | 'completed'
    | 'cancelled';
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

// 架构设计相关
export interface CreateArchitectureArgs {
  projectId: string;
  name: string;
  type: 'system' | 'application' | 'data' | 'deployment' | 'security' | 'integration';
  description?: string;
  content?: string;
}

// API设计相关
export interface CreateApiDesignArgs {
  projectId: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description?: string;
  requestBody?: any;
  responseBody?: any;
}

// 脑图相关
export interface CreateMindMapArgs {
  projectId: string;
  content?: string;
  nodes?: Array<{
    id: string;
    text: string;
    parentId?: string;
    position?: { x: number; y: number };
  }>;
}

// 领域知识相关
export interface CreateDomainKnowledgeArgs {
  projectId: string;
  term: string;
  category: string;
  definition: string;
  context?: string;
  examples?: string[];
}

// 数据结构相关
export interface CreateDataStructureArgs {
  projectId: string;
  name: string;
  type: 'entity' | 'value_object' | 'aggregate' | 'dto' | 'enum';
  fields?: Array<{
    name: string;
    type: string;
    required?: boolean;
    description?: string;
  }>;
}

// 权限管理相关
export interface GetUserPermissionsArgs {
  userId: string;
  projectId: string;
}

export interface AssignProjectRoleArgs {
  userId: string;
  projectId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
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

  // 需求管理相关
  GET_REQUIREMENTS = 'get_requirements',
  GET_REQUIREMENT = 'get_requirement',
  CREATE_REQUIREMENT = 'create_requirement',
  UPDATE_REQUIREMENT = 'update_requirement',

  // 架构设计相关
  GET_ARCHITECTURES = 'get_architectures',
  CREATE_ARCHITECTURE = 'create_architecture',

  // API设计相关
  GET_API_DESIGNS = 'get_api_designs',
  CREATE_API_DESIGN = 'create_api_design',

  // 脑图相关
  GET_MINDMAP = 'get_mindmap',
  CREATE_MINDMAP = 'create_mindmap',

  // 领域知识相关
  GET_DOMAIN_KNOWLEDGE = 'get_domain_knowledge',
  CREATE_DOMAIN_KNOWLEDGE = 'create_domain_knowledge',

  // 数据结构相关
  GET_DATA_STRUCTURES = 'get_data_structures',
  CREATE_DATA_STRUCTURE = 'create_data_structure',

  // 权限管理相关
  GET_USER_PERMISSIONS = 'get_user_permissions',
  ASSIGN_PROJECT_ROLE = 'assign_project_role',
}
