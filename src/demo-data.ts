import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function createDemoData() {
    try {
        console.log('🌱 开始创建演示数据...');

        // 创建多个项目
        const projects = await Promise.all([
            prisma.project.create({
                data: {
                    name: 'ATeam项目管理系统',
                    description: '一个基于Fastify的项目管理MCP工具，支持团队协作和敏捷开发',
                },
            }),
            prisma.project.create({
                data: {
                    name: '电商平台重构',
                    description: '将传统电商平台迁移到微服务架构，提升系统性能和可扩展性',
                },
            }),
            prisma.project.create({
                data: {
                    name: '移动端APP开发',
                    description: '开发跨平台移动应用，支持iOS和Android平台',
                },
            }),
            prisma.project.create({
                data: {
                    name: 'AI助手集成',
                    description: '为现有系统集成AI助手功能，提升用户体验',
                },
            }),
        ]);

        console.log('✅ 项目创建成功:', projects.map(p => p.name));

        // 创建多个团队
        const teams = await Promise.all([
            prisma.team.create({
                data: {
                    name: '后端开发团队',
                    description: '负责后端API开发和数据库设计',
                },
            }),
            prisma.team.create({
                data: {
                    name: '前端开发团队',
                    description: '负责前端界面开发和用户体验优化',
                },
            }),
            prisma.team.create({
                data: {
                    name: '测试团队',
                    description: '负责功能测试、性能测试和自动化测试',
                },
            }),
            prisma.team.create({
                data: {
                    name: '产品设计团队',
                    description: '负责产品需求分析和用户体验设计',
                },
            }),
        ]);

        console.log('✅ 团队创建成功:', teams.map(t => t.name));

        // 创建团队成员
        const teamMembers = await Promise.all([
            // 后端团队成员
            prisma.teamMember.create({
                data: {
                    teamId: teams[0].id,
                    responsibilities: ['API开发', '数据库设计', '系统架构'],
                    skills: ['TypeScript', 'Fastify', 'Prisma', 'PostgreSQL', 'Redis'],
                },
            }),
            prisma.teamMember.create({
                data: {
                    teamId: teams[0].id,
                    responsibilities: ['微服务开发', '性能优化'],
                    skills: ['Node.js', 'Docker', 'Kubernetes', 'MongoDB'],
                },
            }),
            // 前端团队成员
            prisma.teamMember.create({
                data: {
                    teamId: teams[1].id,
                    responsibilities: ['前端开发', 'UI设计'],
                    skills: ['React', 'TypeScript', 'Ant Design', 'CSS3'],
                },
            }),
            prisma.teamMember.create({
                data: {
                    teamId: teams[1].id,
                    responsibilities: ['移动端开发', '跨平台开发'],
                    skills: ['React Native', 'Flutter', 'JavaScript', 'HTML5'],
                },
            }),
            // 测试团队成员
            prisma.teamMember.create({
                data: {
                    teamId: teams[2].id,
                    responsibilities: ['功能测试', '自动化测试'],
                    skills: ['Jest', 'Cypress', 'Selenium', 'Python'],
                },
            }),
            // 产品团队成员
            prisma.teamMember.create({
                data: {
                    teamId: teams[3].id,
                    responsibilities: ['产品设计', '用户研究'],
                    skills: ['Figma', '用户访谈', '数据分析', '原型设计'],
                },
            }),
        ]);

        console.log('✅ 团队成员创建成功');

        // 创建任务
        const tasks = await Promise.all([
            // ATeam项目任务
            prisma.task.create({
                data: {
                    projectId: projects[0].id,
                    teamId: teams[0].id,
                    title: '实现用户认证系统',
                    content: '使用JWT实现用户登录、注册和权限管理功能',
                    status: 'in_progress',
                    dueDate: new Date('2024-12-31'),
                },
            }),
            prisma.task.create({
                data: {
                    projectId: projects[0].id,
                    teamId: teams[1].id,
                    title: '设计管理界面',
                    content: '使用Ant Design设计项目管理和团队管理界面',
                    status: 'todo',
                    dueDate: new Date('2024-12-25'),
                },
            }),
            prisma.task.create({
                data: {
                    projectId: projects[0].id,
                    teamId: teams[2].id,
                    title: '编写单元测试',
                    content: '为所有核心功能编写完整的单元测试',
                    status: 'testing',
                    dueDate: new Date('2024-12-20'),
                },
            }),
            // 电商平台任务
            prisma.task.create({
                data: {
                    projectId: projects[1].id,
                    teamId: teams[0].id,
                    title: '设计微服务架构',
                    content: '设计用户服务、订单服务、商品服务的微服务架构',
                    status: 'done',
                    dueDate: new Date('2024-11-30'),
                },
            }),
            prisma.task.create({
                data: {
                    projectId: projects[1].id,
                    teamId: teams[1].id,
                    title: '重构前端界面',
                    content: '将传统页面重构为SPA应用，提升用户体验',
                    status: 'in_progress',
                    dueDate: new Date('2024-12-15'),
                },
            }),
            // 移动端APP任务
            prisma.task.create({
                data: {
                    projectId: projects[2].id,
                    teamId: teams[1].id,
                    title: '设计APP原型',
                    content: '使用Figma设计移动端APP的原型和交互流程',
                    status: 'todo',
                    dueDate: new Date('2024-12-10'),
                },
            }),
            prisma.task.create({
                data: {
                    projectId: projects[2].id,
                    teamId: teams[3].id,
                    title: '用户需求调研',
                    content: '通过用户访谈和问卷调查了解用户需求',
                    status: 'in_progress',
                    dueDate: new Date('2024-12-05'),
                },
            }),
            // AI助手任务
            prisma.task.create({
                data: {
                    projectId: projects[3].id,
                    teamId: teams[0].id,
                    title: '集成OpenAI API',
                    content: '集成OpenAI API，实现智能问答功能',
                    status: 'todo',
                    dueDate: new Date('2024-12-28'),
                },
            }),
        ]);

        console.log('✅ 任务创建成功:', tasks.map(t => t.title));

        // 分配任务给团队成员
        await Promise.all([
            prisma.teamMemberTask.create({
                data: {
                    teamMemberId: teamMembers[0].id,
                    taskId: tasks[0].id,
                    status: 'in_progress',
                },
            }),
            prisma.teamMemberTask.create({
                data: {
                    teamMemberId: teamMembers[2].id,
                    taskId: tasks[1].id,
                    status: 'todo',
                },
            }),
            prisma.teamMemberTask.create({
                data: {
                    teamMemberId: teamMembers[4].id,
                    taskId: tasks[2].id,
                    status: 'testing',
                },
            }),
        ]);

        console.log('✅ 任务分配成功');

        // 创建Sprint
        const sprints = await Promise.all([
            prisma.sprint.create({
                data: {
                    projectId: projects[0].id,
                    name: 'Sprint 1 - 基础功能',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-01-15'),
                    goal: '完成用户认证和基础项目管理功能',
                    status: 'in_progress',
                },
            }),
            prisma.sprint.create({
                data: {
                    projectId: projects[0].id,
                    name: 'Sprint 2 - 高级功能',
                    startDate: new Date('2024-01-16'),
                    endDate: new Date('2024-01-31'),
                    goal: '完成路线图和仪表盘功能',
                    status: 'todo',
                },
            }),
            prisma.sprint.create({
                data: {
                    projectId: projects[1].id,
                    name: 'Sprint 1 - 架构设计',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-01-20'),
                    goal: '完成微服务架构设计和基础服务开发',
                    status: 'done',
                },
            }),
        ]);

        console.log('✅ Sprint创建成功:', sprints.map(s => s.name));

        // 创建文档
        const documents = await Promise.all([
            prisma.documentation.create({
                data: {
                    teamMemberId: teamMembers[0].id,
                    projectId: projects[0].id,
                    teamId: teams[0].id,
                    name: 'API设计文档',
                    content: '详细的API接口设计说明，包括认证、项目管理、团队管理等接口',
                    type: 'technical',
                    url: 'https://docs.example.com/api',
                },
            }),
            prisma.documentation.create({
                data: {
                    teamMemberId: teamMembers[1].id,
                    projectId: projects[0].id,
                    teamId: teams[1].id,
                    name: '前端架构文档',
                    content: '前端技术栈选择和组件设计说明',
                    type: 'design',
                },
            }),
            prisma.documentation.create({
                data: {
                    teamMemberId: teamMembers[2].id,
                    projectId: projects[1].id,
                    teamId: teams[0].id,
                    name: '微服务架构设计',
                    content: '电商平台微服务架构设计文档，包括服务拆分、数据一致性、部署方案',
                    type: 'technical',
                },
            }),
            prisma.documentation.create({
                data: {
                    teamMemberId: teamMembers[3].id,
                    projectId: projects[2].id,
                    teamId: teams[3].id,
                    name: '用户需求分析报告',
                    content: '移动端APP用户需求调研和分析报告',
                    type: 'research',
                },
            }),
        ]);

        console.log('✅ 文档创建成功:', documents.map(d => d.name));

        // 创建需求
        const requirements = await Promise.all([
            prisma.requirement.create({
                data: {
                    teamId: teams[0].id,
                    teamMemberId: teamMembers[0].id,
                    projectId: projects[0].id,
                    content: '系统需要支持多用户协作，包括角色权限管理',
                },
            }),
            prisma.requirement.create({
                data: {
                    teamId: teams[1].id,
                    teamMemberId: teamMembers[1].id,
                    projectId: projects[0].id,
                    content: '需要提供完整的REST API和MCP接口',
                },
            }),
            prisma.requirement.create({
                data: {
                    teamId: teams[0].id,
                    teamMemberId: teamMembers[2].id,
                    projectId: projects[1].id,
                    content: '电商平台需要支持高并发访问，峰值TPS达到10000',
                },
            }),
            prisma.requirement.create({
                data: {
                    teamId: teams[1].id,
                    teamMemberId: teamMembers[3].id,
                    projectId: projects[2].id,
                    content: '移动端APP需要支持离线功能，数据同步机制',
                },
            }),
        ]);

        console.log('✅ 需求创建成功');

        // 创建需求问题
        const questions = await Promise.all([
            prisma.requirementQuestion.create({
                data: {
                    teamId: teams[0].id,
                    teamMemberId: teamMembers[0].id,
                    projectId: projects[0].id,
                    question: '用户权限系统应该支持哪些角色？',
                    answer: '建议支持管理员、项目经理、开发人员、测试人员等角色',
                    status: 'done',
                    clarified: true,
                },
            }),
            prisma.requirementQuestion.create({
                data: {
                    teamId: teams[1].id,
                    teamMemberId: teamMembers[1].id,
                    projectId: projects[1].id,
                    question: '微服务之间的通信方式如何选择？',
                    answer: '建议使用gRPC进行服务间通信，使用消息队列处理异步事件',
                    status: 'in_progress',
                    clarified: false,
                },
            }),
            prisma.requirementQuestion.create({
                data: {
                    teamId: teams[2].id,
                    teamMemberId: teamMembers[2].id,
                    projectId: projects[2].id,
                    question: '移动端APP的技术栈选择？',
                    answer: '建议使用React Native或Flutter实现跨平台开发',
                    status: 'todo',
                    clarified: false,
                },
            }),
        ]);

        console.log('✅ 需求问题创建成功');

        // 创建领域知识
        const domainKnowledge = await Promise.all([
            prisma.domainKnowledge.create({
                data: {
                    teamId: teams[0].id,
                    teamMemberId: teamMembers[0].id,
                    projectId: projects[0].id,
                    domain: '项目管理',
                    concepts: ['敏捷开发', 'Scrum', '看板', '用户故事', '迭代'],
                    commonPatterns: ['用户故事拆分', '任务分解', '迭代开发', '持续集成'],
                    bestPractices: ['每日站会', '代码审查', '测试驱动开发', '持续部署'],
                    antiPatterns: ['瀑布式开发', '过度设计', '技术债务', '大爆炸发布'],
                },
            }),
            prisma.domainKnowledge.create({
                data: {
                    teamId: teams[1].id,
                    teamMemberId: teamMembers[1].id,
                    projectId: projects[1].id,
                    domain: '电商系统',
                    concepts: ['微服务', '分布式系统', 'CAP理论', '最终一致性'],
                    commonPatterns: ['事件驱动架构', 'CQRS模式', 'Saga模式', 'API网关'],
                    bestPractices: ['服务监控', '熔断器模式', '重试机制', '缓存策略'],
                    antiPatterns: ['单体架构', '紧耦合', '同步调用', '数据不一致'],
                },
            }),
        ]);

        console.log('✅ 领域知识创建成功:', domainKnowledge.map(d => d.domain));

        // 创建系统架构
        const architectures = await Promise.all([
            prisma.systemArchitecture.create({
                data: {
                    teamId: teams[0].id,
                    teamMemberId: teamMembers[0].id,
                    projectId: projects[0].id,
                    overview: '基于Fastify的RESTful API服务，使用Prisma作为ORM，支持PostgreSQL数据库',
                    platforms: ['web'],
                    components: ['认证服务', '项目管理', '团队管理', '任务管理', '文档管理'],
                    technologies: ['Fastify', 'Prisma', 'PostgreSQL', 'JWT', 'TypeScript'],
                    notes: '采用模块化设计，支持MCP协议集成',
                },
            }),
            prisma.systemArchitecture.create({
                data: {
                    teamId: teams[1].id,
                    teamMemberId: teamMembers[1].id,
                    projectId: projects[1].id,
                    overview: '基于微服务架构的电商平台，支持高并发和水平扩展',
                    platforms: ['web', 'mobile'],
                    components: ['用户服务', '商品服务', '订单服务', '支付服务', '库存服务'],
                    technologies: ['Spring Boot', 'Docker', 'Kubernetes', 'Redis', 'MySQL'],
                    notes: '使用事件驱动架构，保证数据最终一致性',
                },
            }),
        ]);

        console.log('✅ 系统架构创建成功');

        // 创建路线图
        const roadmaps = await Promise.all([
            prisma.roadmap.create({
                data: {
                    projectId: projects[0].id,
                    name: 'ATeam产品路线图',
                    description: 'ATeam项目管理系统的产品发展路线图',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-12-31'),
                    status: 'active',
                },
            }),
            prisma.roadmap.create({
                data: {
                    projectId: projects[1].id,
                    name: '电商平台重构路线图',
                    description: '电商平台从单体架构到微服务架构的迁移路线图',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-06-30'),
                    status: 'active',
                },
            }),
        ]);

        console.log('✅ 路线图创建成功:', roadmaps.map(r => r.name));

        // 创建里程碑
        const milestones = await Promise.all([
            prisma.milestone.create({
                data: {
                    roadmapId: roadmaps[0].id,
                    name: 'v1.0 基础版本',
                    description: '完成基础的项目管理功能',
                    targetDate: new Date('2024-03-31'),
                    status: 'in_progress',
                    priority: 'high',
                },
            }),
            prisma.milestone.create({
                data: {
                    roadmapId: roadmaps[0].id,
                    name: 'v2.0 高级功能',
                    description: '添加路线图和仪表盘功能',
                    targetDate: new Date('2024-06-30'),
                    status: 'planned',
                    priority: 'medium',
                },
            }),
            prisma.milestone.create({
                data: {
                    roadmapId: roadmaps[1].id,
                    name: '架构设计完成',
                    description: '完成微服务架构设计和基础服务开发',
                    targetDate: new Date('2024-02-29'),
                    status: 'completed',
                    priority: 'critical',
                },
            }),
        ]);

        console.log('✅ 里程碑创建成功:', milestones.map(m => m.name));

        // 创建版本
        const versions = await Promise.all([
            prisma.version.create({
                data: {
                    roadmapId: roadmaps[0].id,
                    name: 'v1.0.0',
                    description: '基础项目管理功能版本',
                    releaseDate: new Date('2024-03-31'),
                    status: 'in_development',
                },
            }),
            prisma.version.create({
                data: {
                    roadmapId: roadmaps[0].id,
                    name: 'v1.1.0',
                    description: '添加用户权限管理功能',
                    releaseDate: new Date('2024-04-30'),
                    status: 'planned',
                },
            }),
        ]);

        console.log('✅ 版本创建成功:', versions.map(v => v.name));

        // 创建功能
        const features = await Promise.all([
            prisma.feature.create({
                data: {
                    milestoneId: milestones[0].id,
                    versionId: versions[0].id,
                    name: '用户认证系统',
                    description: '实现用户注册、登录和权限管理',
                    status: 'in_development',
                    priority: 'high',
                    effort: '3周',
                },
            }),
            prisma.feature.create({
                data: {
                    milestoneId: milestones[0].id,
                    versionId: versions[0].id,
                    name: '项目管理',
                    description: '基础的项目创建、编辑、删除功能',
                    status: 'completed',
                    priority: 'high',
                    effort: '2周',
                },
            }),
            prisma.feature.create({
                data: {
                    milestoneId: milestones[1].id,
                    versionId: versions[1].id,
                    name: '角色权限管理',
                    description: '支持多角色权限控制和访问管理',
                    status: 'planned',
                    priority: 'medium',
                    effort: '4周',
                },
            }),
        ]);

        console.log('✅ 功能创建成功:', features.map(f => f.name));

        // 关联任务到功能
        await prisma.task.update({
            where: { id: tasks[0].id },
            data: { featureId: features[0].id },
        });

        console.log('✅ 任务功能关联成功');

        console.log('🎉 所有演示数据创建完成！');

        // 显示统计信息
        const stats = await Promise.all([
            prisma.project.count(),
            prisma.team.count(),
            prisma.teamMember.count(),
            prisma.task.count(),
            prisma.sprint.count(),
            prisma.documentation.count(),
            prisma.requirement.count(),
            prisma.requirementQuestion.count(),
            prisma.domainKnowledge.count(),
            prisma.systemArchitecture.count(),
            prisma.roadmap.count(),
            prisma.milestone.count(),
            prisma.version.count(),
            prisma.feature.count(),
        ]);

        console.log('\n📊 数据统计:');
        console.log(`- 项目: ${stats[0]}`);
        console.log(`- 团队: ${stats[1]}`);
        console.log(`- 团队成员: ${stats[2]}`);
        console.log(`- 任务: ${stats[3]}`);
        console.log(`- Sprint: ${stats[4]}`);
        console.log(`- 文档: ${stats[5]}`);
        console.log(`- 需求: ${stats[6]}`);
        console.log(`- 需求问题: ${stats[7]}`);
        console.log(`- 领域知识: ${stats[8]}`);
        console.log(`- 系统架构: ${stats[9]}`);
        console.log(`- 路线图: ${stats[10]}`);
        console.log(`- 里程碑: ${stats[11]}`);
        console.log(`- 版本: ${stats[12]}`);
        console.log(`- 功能: ${stats[13]}`);

    } catch (error) {
        console.error('❌ 创建演示数据失败:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createDemoData(); 