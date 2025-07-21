// 注意：这里故意使用 any 类型，因为我们是在创建 mock
// 实际的 PrismaClient 类型会在各个服务中从 generated/prisma 导入

// Mock Prisma Client
export const prismaMock = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  session: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  projectMember: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  project: {
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  documentation: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  documentVersion: {
    create: jest.fn(),
  },
  documentTag: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  milestone: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  version: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  feature: {
    count: jest.fn(),
  },
  roadmap: {
    findUnique: jest.fn(),
  },
  auditLog: {
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  requirement: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  requirementQuestion: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  requirementAttachment: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  domainKnowledge: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  mindMap: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  mindMapNode: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  systemArchitecture: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  apiDesign: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  agentTask: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  agent: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  task: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  agentActivity: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  agentWorklog: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation((fn) => {
    // 如果传入的是函数，执行它并返回结果
    if (typeof fn === 'function') {
      return fn(prismaMock);
    }
    // 如果传入的是数组（批量操作），返回 mock 结果
    return Promise.resolve(fn.map(() => ({ count: 0 })));
  }),
};

// 添加别名支持
(prismaMock as any).minimap = prismaMock.mindMap;

// Mock generated prisma client
jest.mock('../../generated/prisma', () => ({
  PrismaClient: jest.fn(() => prismaMock),
  // 导出枚举类型
  UserRole: {
    admin: 'admin',
    user: 'user',
  },
  ProjectRole: {
    owner: 'owner',
    admin: 'admin',
    member: 'member',
    viewer: 'viewer',
  },
  DocumentType: {
    requirement: 'requirement',
    design: 'design',
    api: 'api',
    database: 'database',
    deployment: 'deployment',
    test: 'test',
    other: 'other',
  },
  DocumentStatus: {
    draft: 'draft',
    reviewing: 'reviewing',
    approved: 'approved',
    published: 'published',
    archived: 'archived',
  },
  DocumentVisibility: {
    public: 'public',
    project: 'project',
    team: 'team',
    private: 'private',
  },
  RequirementType: {
    functional: 'functional',
    non_functional: 'non_functional',
    business: 'business',
    technical: 'technical',
    constraint: 'constraint',
  },
  RequirementPriority: {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
  },
  RequirementStatus: {
    draft: 'draft',
    reviewing: 'reviewing',
    approved: 'approved',
    implementing: 'implementing',
    testing: 'testing',
    completed: 'completed',
    cancelled: 'cancelled',
  },
  RequirementSource: {
    client: 'client',
    internal: 'internal',
    market: 'market',
    regulatory: 'regulatory',
    technical: 'technical',
  },
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => Promise.resolve(hash === `hashed_${password}`)),
}));

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
