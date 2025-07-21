// 测试MCP核心功能
import { toolsDefinition } from './tools-definition';

console.log('MCP 工具定义测试\n');

// 统计工具类别
const toolCategories: Record<string, string[]> = {};

toolsDefinition.forEach(tool => {
  let category = '其他';
  
  if (tool.name.includes('project')) category = '项目管理';
  else if (tool.name.includes('team')) category = '团队管理';
  else if (tool.name.includes('task')) category = '任务管理';
  else if (tool.name.includes('sprint')) category = 'Sprint管理';
  else if (tool.name.includes('documentation')) category = '文档管理';
  else if (tool.name.includes('roadmap') || tool.name.includes('milestone') || tool.name.includes('version') || tool.name.includes('feature')) category = '路线图管理';
  else if (tool.name.includes('agent')) category = 'Agent工作流';
  else if (tool.name.includes('requirement')) category = '需求管理';
  else if (tool.name.includes('architecture')) category = '架构设计';
  else if (tool.name.includes('api')) category = 'API设计';
  else if (tool.name.includes('mindmap')) category = '脑图';
  else if (tool.name.includes('domain')) category = '领域知识';
  else if (tool.name.includes('data_structure')) category = '数据结构';
  else if (tool.name.includes('permission')) category = '权限管理';
  else if (tool.name.includes('dashboard') || tool.name.includes('stats')) category = '统计分析';
  
  if (!toolCategories[category]) {
    toolCategories[category] = [];
  }
  toolCategories[category].push(tool.name);
});

// 输出统计结果
console.log(`总共定义了 ${toolsDefinition.length} 个工具\n`);

console.log('按类别分组：');
Object.entries(toolCategories).forEach(([category, tools]) => {
  console.log(`\n${category} (${tools.length}个):`);
  tools.forEach(tool => console.log(`  - ${tool}`));
});

// 验证工具定义的完整性
console.log('\n\n验证工具定义完整性：');
let hasErrors = false;

toolsDefinition.forEach(tool => {
  const errors: string[] = [];
  
  if (!tool.name) errors.push('缺少名称');
  if (!tool.description) errors.push('缺少描述');
  if (!tool.inputSchema) errors.push('缺少输入模式');
  if (tool.inputSchema && !tool.inputSchema.type) errors.push('输入模式缺少类型');
  if (tool.inputSchema && !tool.inputSchema.properties) errors.push('输入模式缺少属性');
  
  if (errors.length > 0) {
    hasErrors = true;
    console.log(`❌ ${tool.name || '未知工具'}: ${errors.join(', ')}`);
  }
});

if (!hasErrors) {
  console.log('✅ 所有工具定义都是完整的！');
}

// 查找新增的工具
const newTools = [
  'get_requirements', 'get_requirement', 'create_requirement', 'update_requirement',
  'get_architectures', 'create_architecture',
  'get_api_designs', 'create_api_design',
  'get_mindmap', 'create_mindmap',
  'get_domain_knowledge', 'create_domain_knowledge',
  'get_data_structures', 'create_data_structure',
  'get_user_permissions', 'assign_project_role'
];

console.log('\n\n新增的MCP工具：');
newTools.forEach(toolName => {
  const tool = toolsDefinition.find(t => t.name === toolName);
  if (tool) {
    console.log(`✅ ${toolName}: ${tool.description}`);
  } else {
    console.log(`❌ ${toolName}: 未找到`);
  }
});

console.log('\n\nMCP 工具定义测试完成！');