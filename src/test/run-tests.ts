#!/usr/bin/env node

/**
 * 测试运行脚本
 * 用于运行所有测试并生成覆盖率报告
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

// 测试组
const testGroups = {
  auth: [
    'src/services/auth/user.service.spec.ts',
    'src/services/auth/session.service.spec.ts',
    'src/services/auth/project-member.service.spec.ts',
  ],
  documentation: ['src/services/documentation/documentation.service.spec.ts'],
  roadmap: [
    'src/services/roadmap/milestone.service.spec.ts',
    'src/services/roadmap/version.service.spec.ts',
  ],
};

// 运行单个测试文件
async function runTest(testFile: string) {
  console.log(`\n📝 Running test: ${testFile}`);
  try {
    const { stdout, stderr } = await execAsync(`npm test -- ${testFile}`);
    if (stderr) {
      console.error(`❌ Error in ${testFile}:`, stderr);
      return false;
    }
    console.log(stdout);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to run ${testFile}:`, error.message);
    return false;
  }
}

// 运行测试组
async function runTestGroup(groupName: string, tests: string[]) {
  console.log(`\n🗂️  Running ${groupName} tests...`);
  const results = await Promise.all(tests.map(runTest));
  const passed = results.filter(Boolean).length;
  const failed = results.filter((r) => !r).length;

  console.log(`\n📊 ${groupName} results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 Starting test suite...\n');

  const groupResults = [];
  for (const [_groupName, tests] of Object.entries(testGroups)) {
    const success = await runTestGroup(_groupName, tests);
    groupResults.push({ group: _groupName, success });
  }

  // 生成覆盖率报告
  console.log('\n📈 Generating coverage report...');
  try {
    const { stdout } = await execAsync('npm run test:cov');
    console.log(stdout);
  } catch (error: any) {
    console.error('❌ Failed to generate coverage report:', error.message);
  }

  // 总结
  console.log('\n📋 Test Summary:');
  console.log('================');
  groupResults.forEach(({ group, success }) => {
    console.log(`${success ? '✅' : '❌'} ${group}`);
  });

  const allPassed = groupResults.every((r) => r.success);
  if (allPassed) {
    console.log('\n✨ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed. Please check the logs above.');
    process.exit(1);
  }
}

// 检查测试文件是否存在
async function checkTestFiles() {
  console.log('🔍 Checking test files...\n');

  for (const [_groupName, tests] of Object.entries(testGroups)) {
    for (const testFile of tests) {
      const fullPath = path.join(process.cwd(), testFile);
      try {
        await fs.access(fullPath);
        console.log(`✅ Found: ${testFile}`);
      } catch {
        console.log(`❌ Missing: ${testFile}`);
      }
    }
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--check')) {
    await checkTestFiles();
  } else if (args.includes('--group')) {
    const groupIndex = args.indexOf('--group');
    const groupName = args[groupIndex + 1];
    if (groupName && testGroups[groupName]) {
      await runTestGroup(groupName, testGroups[groupName]);
    } else {
      console.error(`❌ Unknown test group: ${groupName}`);
      console.log('Available groups:', Object.keys(testGroups).join(', '));
    }
  } else {
    await runAllTests();
  }
}

// 运行
main().catch(console.error);
