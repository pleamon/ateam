// 认证相关类型
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// 项目相关类型
export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

// 团队相关类型
export interface CreateTeamRequest {
  name: string;
  projectId: number;
  description?: string;
}

export interface AddTeamMemberRequest {
  userId: number;
  role: string;
}

// 任务相关类型
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  sprintId?: number;
  assigneeId?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  sprintId?: number;
  assigneeId?: number;
}

// Sprint相关类型
export interface CreateSprintRequest {
  name: string;
  projectId: number;
  startDate: Date;
  endDate: Date;
  goal?: string;
}

export interface UpdateSprintRequest {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  goal?: string;
  status?: string;
}

// 文档相关类型
export interface CreateDocumentationRequest {
  title: string;
  content: string;
  type: string;
  projectId: number;
}

export interface UpdateDocumentationRequest {
  title?: string;
  content?: string;
  type?: string;
}

// Roadmap相关类型
export interface CreateRoadmapRequest {
  projectId: number;
  title: string;
  description?: string;
}

export interface CreateMilestoneRequest {
  roadmapId: number;
  title: string;
  description?: string;
  dueDate: Date;
}

// Agent相关类型
export interface CreateAgentRequest {
  name: string;
  type: string;
  description?: string;
  capabilities?: string[];
  systemPrompt?: string;
  model?: string;
}

export interface UpdateAgentRequest {
  name?: string;
  type?: string;
  description?: string;
  capabilities?: string[];
  systemPrompt?: string;
  model?: string;
  status?: string;
}

// 通用查询参数类型
export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ID参数类型
export interface IdParams {
  id: string;
}

export interface ProjectIdParams {
  projectId: string;
}

export interface TeamIdParams {
  teamId: string;
}

export interface TaskIdParams {
  taskId: string;
}

export interface SprintIdParams {
  sprintId: string;
}
