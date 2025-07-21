import { ToolHandler } from './tool-handler';

// 简单测试脚本
async function testMCP() {
  console.log('测试 MCP 基本功能...\n');

  try {
    // 测试获取项目列表
    console.log('1. 测试获取项目列表');
    const projectsResult = await ToolHandler.handleToolCall('get_projects', {});
    console.log('项目列表结果:', JSON.stringify(projectsResult, null, 2).substring(0, 200) + '...');

    // 测试创建项目
    console.log('\n2. 测试创建项目');
    const createProjectResult = await ToolHandler.handleToolCall('create_project', {
      name: 'MCP测试项目',
      description: '用于测试MCP功能的项目',
    });
    console.log('创建项目结果:', createProjectResult);

    console.log('\n✅ 基础功能测试完成！');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
if (require.main === module) {
  testMCP().catch(console.error);
}

export { testMCP };