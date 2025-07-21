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
  // 需求管理工具
  {
    name: 'get_requirements',
    description: '获取项目的所有需求列表',
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
  {
    name: 'get_requirement',
    description: '根据ID获取需求详情',
    inputSchema: {
      type: 'object',
      properties: {
        requirementId: {
          type: 'string',
          description: '需求ID',
        },
      },
      required: ['requirementId'],
    },
  },
  {
    name: 'create_requirement',
    description: '创建新需求',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
        },
        title: {
          type: 'string',
          description: '需求标题',
        },
        description: {
          type: 'string',
          description: '需求描述',
        },
        type: {
          type: 'string',
          enum: ['functional', 'non_functional', 'business', 'technical', 'constraint'],
          description: '需求类型',
        },
        priority: {
          type: 'string',
          enum: ['critical', 'high', 'medium', 'low'],
          description: '优先级',
        },
        source: {
          type: 'string',
          enum: ['client', 'internal', 'market', 'regulatory', 'technical'],
          description: '需求来源',
        },
      },
      required: ['projectId', 'title', 'type', 'priority'],
    },
  },
  {
    name: 'update_requirement',
    description: '更新需求信息',
    inputSchema: {
      type: 'object',
      properties: {
        requirementId: {
          type: 'string',
          description: '需求ID',
        },
        title: {
          type: 'string',
          description: '需求标题',
        },
        description: {
          type: 'string',
          description: '需求描述',
        },
        status: {
          type: 'string',
          enum: ['draft', 'reviewing', 'approved', 'implementing', 'testing', 'completed', 'cancelled'],
          description: '需求状态',
        },
        priority: {
          type: 'string',
          enum: ['critical', 'high', 'medium', 'low'],
          description: '优先级',
        },
      },
      required: ['requirementId'],
    },
  },
  // 架构设计工具
  {
    name: 'get_architectures',
    description: '获取项目的所有架构设计文档',
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
  {
    name: 'create_architecture',
    description: '创建架构设计文档',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
        },
        name: {
          type: 'string',
          description: '架构名称',
        },
        type: {
          type: 'string',
          enum: ['system', 'application', 'data', 'deployment', 'security', 'integration'],
          description: '架构类型',
        },
        description: {
          type: 'string',
          description: '架构描述',
        },
        content: {
          type: 'string',
          description: '架构详细内容（支持Markdown）',
        },
      },
      required: ['projectId', 'name', 'type'],
    },
  },
  // API设计工具
  {
    name: 'get_api_designs',
    description: '获取项目的所有API设计文档',
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
  {
    name: 'create_api_design',
    description: '创建API设计文档',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
        },
        name: {
          type: 'string',
          description: 'API名称',
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          description: 'HTTP方法',
        },
        path: {
          type: 'string',
          description: 'API路径',
        },
        description: {
          type: 'string',
          description: 'API描述',
        },
        requestBody: {
          type: 'object',
          description: '请求体结构',
        },
        responseBody: {
          type: 'object',
          description: '响应体结构',
        },
      },
      required: ['projectId', 'name', 'method', 'path'],
    },
  },
  // 脑图工具
  {
    name: 'get_mindmap',
    description: '获取项目的脑图',
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
    name: 'create_mindmap',
    description: '创建或更新项目脑图',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
        },
        content: {
          type: 'string',
          description: '脑图内容（JSON格式）',
        },
        nodes: {
          type: 'array',
          description: '脑图节点数组',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: '节点ID',
              },
              text: {
                type: 'string',
                description: '节点文本',
              },
              parentId: {
                type: 'string',
                description: '父节点ID',
              },
              position: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                },
              },
            },
          },
        },
      },
      required: ['projectId'],
    },
  },
  // 领域知识管理工具
  {
    name: 'get_domain_knowledge',
    description: '获取项目的领域知识列表',
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
  {
    name: 'create_domain_knowledge',
    description: '创建领域知识条目',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
        },
        term: {
          type: 'string',
          description: '术语名称',
        },
        category: {
          type: 'string',
          description: '分类',
        },
        definition: {
          type: 'string',
          description: '定义说明',
        },
        context: {
          type: 'string',
          description: '使用上下文',
        },
        examples: {
          type: 'array',
          items: { type: 'string' },
          description: '示例列表',
        },
      },
      required: ['projectId', 'term', 'category', 'definition'],
    },
  },
  // 数据结构设计工具
  {
    name: 'get_data_structures',
    description: '获取项目的数据结构设计',
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
  {
    name: 'create_data_structure',
    description: '创建数据结构设计',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
        },
        name: {
          type: 'string',
          description: '数据结构名称',
        },
        type: {
          type: 'string',
          enum: ['entity', 'value_object', 'aggregate', 'dto', 'enum'],
          description: '数据结构类型',
        },
        fields: {
          type: 'array',
          description: '字段列表',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string' },
              required: { type: 'boolean' },
              description: { type: 'string' },
            },
          },
        },
      },
      required: ['projectId', 'name', 'type'],
    },
  },
  // 权限管理工具
  {
    name: 'get_user_permissions',
    description: '获取用户在项目中的权限',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: '用户ID',
        },
        projectId: {
          type: 'string',
          description: '项目ID',
        },
      },
      required: ['userId', 'projectId'],
    },
  },
  {
    name: 'assign_project_role',
    description: '分配项目角色给用户',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: '用户ID',
        },
        projectId: {
          type: 'string',
          description: '项目ID',
        },
        role: {
          type: 'string',
          enum: ['owner', 'admin', 'member', 'viewer'],
          description: '项目角色',
        },
      },
      required: ['userId', 'projectId', 'role'],
    },
  },
];
