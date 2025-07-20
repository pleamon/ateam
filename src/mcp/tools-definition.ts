export const toolsDefinition = [
  // 项目相关工具
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
  // Agent 工作流工具
  {
    name: 'agent_checkin',
    description: 'Agent 签到，注册为活跃的工作 Agent',
    inputSchema: {
      type: 'object',
      properties: {
        agentName: {
          type: 'string',
          description: 'Agent 名称',
        },
        agentRole: {
          type: 'string',
          description: 'Agent 角色（如 PM、架构师、前端、后端、测试等）',
        },
        projectId: {
          type: 'string',
          description: '项目ID',
        },
      },
      required: ['agentName', 'agentRole', 'projectId'],
    },
  },
  {
    name: 'agent_checkout',
    description: 'Agent 签出，结束工作',
    inputSchema: {
      type: 'object',
      properties: {
        teamMemberId: {
          type: 'string',
          description: '团队成员ID',
        },
      },
      required: ['teamMemberId'],
    },
  },
  {
    name: 'get_agent_tasks',
    description: '获取分配给 Agent 的任务',
    inputSchema: {
      type: 'object',
      properties: {
        teamMemberId: {
          type: 'string',
          description: '团队成员ID',
        },
      },
      required: ['teamMemberId'],
    },
  },
  {
    name: 'get_task_context',
    description: '获取任务的完整上下文（需求、架构、文档等）',
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
    name: 'submit_work',
    description: '提交工作成果',
    inputSchema: {
      type: 'object',
      properties: {
        teamMemberId: {
          type: 'string',
          description: '团队成员ID',
        },
        taskId: {
          type: 'string',
          description: '任务ID（可选）',
        },
        workType: {
          type: 'string',
          enum: ['documentation', 'architecture', 'code', 'test', 'other'],
          description: '工作类型',
        },
        content: {
          type: 'string',
          description: '工作内容',
        },
        metadata: {
          type: 'object',
          description: '附加元数据',
        },
      },
      required: ['teamMemberId', 'workType', 'content'],
    },
  },
  {
    name: 'record_worklog',
    description: '记录工作日志',
    inputSchema: {
      type: 'object',
      properties: {
        teamMemberId: {
          type: 'string',
          description: '团队成员ID',
        },
        taskId: {
          type: 'string',
          description: '任务ID（可选）',
        },
        content: {
          type: 'string',
          description: '工作内容',
        },
        projectId: {
          type: 'string',
          description: '项目ID',
        },
      },
      required: ['teamMemberId', 'content', 'projectId'],
    },
  },
  {
    name: 'get_agent_prompt',
    description: '获取 Agent 的工作提示词',
    inputSchema: {
      type: 'object',
      properties: {
        teamMemberId: {
          type: 'string',
          description: '团队成员ID',
        },
      },
      required: ['teamMemberId'],
    },
  },
  {
    name: 'request_collaboration',
    description: 'Agent 请求与其他 Agent 协作',
    inputSchema: {
      type: 'object',
      properties: {
        fromMemberId: {
          type: 'string',
          description: '发起方团队成员ID',
        },
        toMemberId: {
          type: 'string',
          description: '接收方团队成员ID',
        },
        context: {
          type: 'object',
          description: '协作上下文',
        },
      },
      required: ['fromMemberId', 'toMemberId', 'context'],
    },
  },
];
