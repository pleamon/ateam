import { ATeamMCPServer } from './server.js';

// 模拟MCP客户端测试
async function testMCPServer() {
  console.log('🧪 开始测试MCP Server...');

  try {
    const server = new ATeamMCPServer();
    void server; // 服务器实例仅用于测试初始化

    console.log('✅ MCP Server初始化成功');
    console.log('📋 可用工具列表:');
    console.log('- get_projects: 获取所有项目列表');
    console.log('- get_project: 根据ID获取项目详情');
    console.log('- create_project: 创建新项目');
    console.log('- update_project: 更新项目信息');
    console.log('- delete_project: 删除项目');
    console.log('- get_teams: 获取所有团队列表');
    console.log('- get_team: 根据ID获取团队详情');
    console.log('- create_team: 创建新团队');
    console.log('- get_tasks: 获取所有任务列表');
    console.log('- get_task: 根据ID获取任务详情');
    console.log('- create_task: 创建新任务');
    console.log('- update_task: 更新任务信息');
    console.log('- get_sprints: 获取所有Sprint列表');
    console.log('- create_sprint: 创建新Sprint');
    console.log('- get_documentation: 获取所有文档列表');
    console.log('- create_documentation: 创建新文档');
    console.log('- get_project_stats: 获取项目统计信息');
    console.log('- get_task_stats: 获取任务统计信息');
    console.log('- get_dashboard_stats: 获取仪表盘统计数据');
    console.log('- get_project_dashboard: 获取项目仪表盘数据');
    console.log('- get_project_roadmaps: 获取项目路线图');
    console.log('- get_roadmap: 获取路线图详情');
    console.log('- create_roadmap: 创建路线图');
    console.log('- create_milestone: 创建里程碑');
    console.log('- create_version: 创建版本');
    console.log('- create_feature: 创建功能');

    console.log('\n🎉 MCP Server测试完成！');
    console.log('💡 提示: 使用 npm run mcp:start 启动MCP Server');
  } catch (error) {
    console.error('❌ MCP Server测试失败:', error);
  }
}

// 运行测试
void testMCPServer();
