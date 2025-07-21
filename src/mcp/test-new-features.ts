import { ToolHandler } from './tool-handler';

// 测试新功能的脚本
async function testNewFeatures() {
  console.log('测试 MCP 新功能...\n');

  try {
    // 测试需求管理
    console.log('1. 测试需求管理功能');
    const requirementResult = await ToolHandler.handleToolCall('create_requirement', {
      projectId: 'test-project-1',
      title: '实现用户认证功能',
      description: '支持邮箱、手机号登录，包含注册、登录、忘记密码功能',
      type: 'functional',
      priority: 'high',
      source: 'client',
    });
    console.log('创建需求结果:', requirementResult);

    // 测试架构设计
    console.log('\n2. 测试架构设计功能');
    const architectureResult = await ToolHandler.handleToolCall('create_architecture', {
      projectId: 'test-project-1',
      name: '系统整体架构',
      type: 'system',
      description: '基于微服务的分布式架构',
      content: '## 架构概述\n\n系统采用微服务架构...',
    });
    console.log('创建架构设计结果:', architectureResult);

    // 测试API设计
    console.log('\n3. 测试API设计功能');
    const apiResult = await ToolHandler.handleToolCall('create_api_design', {
      projectId: 'test-project-1',
      name: '用户登录接口',
      method: 'POST',
      path: '/api/auth/login',
      description: '用户登录认证接口',
      requestBody: {
        email: 'string',
        password: 'string',
      },
      responseBody: {
        token: 'string',
        user: {
          id: 'string',
          name: 'string',
          email: 'string',
        },
      },
    });
    console.log('创建API设计结果:', apiResult);

    // 测试脑图
    console.log('\n4. 测试脑图功能');
    const mindmapResult = await ToolHandler.handleToolCall('create_mindmap', {
      projectId: 'test-project-1',
      nodes: [
        {
          id: 'root',
          text: 'ATeam项目',
          position: { x: 0, y: 0 },
        },
        {
          id: 'node1',
          text: '前端开发',
          parentId: 'root',
          position: { x: 200, y: 0 },
        },
        {
          id: 'node2',
          text: '后端开发',
          parentId: 'root',
          position: { x: 200, y: 100 },
        },
      ],
    });
    console.log('创建脑图结果:', mindmapResult);

    // 测试领域知识
    console.log('\n5. 测试领域知识管理功能');
    const domainResult = await ToolHandler.handleToolCall('create_domain_knowledge', {
      projectId: 'test-project-1',
      term: 'MCP',
      category: '技术概念',
      definition: 'Model Context Protocol，用于AI Agent与外部工具交互的协议',
      context: '在AI应用开发中使用',
      examples: ['Claude MCP', 'OpenAI Function Calling'],
    });
    console.log('创建领域知识结果:', domainResult);

    // 测试数据结构
    console.log('\n6. 测试数据结构设计功能');
    const dataStructureResult = await ToolHandler.handleToolCall('create_data_structure', {
      projectId: 'test-project-1',
      name: 'User',
      type: 'entity',
      fields: [
        { name: 'id', type: 'string', required: true, description: '用户ID' },
        { name: 'email', type: 'string', required: true, description: '邮箱' },
        { name: 'name', type: 'string', required: true, description: '姓名' },
        { name: 'avatar', type: 'string', required: false, description: '头像URL' },
      ],
    });
    console.log('创建数据结构结果:', dataStructureResult);

    console.log('\n✅ 所有新功能测试完成！');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
if (require.main === module) {
  testNewFeatures().catch(console.error);
}

export { testNewFeatures };