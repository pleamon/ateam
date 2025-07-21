#!/bin/bash

echo "测试 ATeam API..."
echo ""

# 测试获取项目列表
echo "1. 测试 GET /api/projects"
curl -X GET http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | jq . 2>/dev/null || echo "请求失败或服务器未启动"

echo ""
echo "2. 测试 POST /api/projects"
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试项目",
    "description": "这是一个测试项目"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | jq . 2>/dev/null || echo "请求失败或服务器未启动"

echo ""
echo "测试完成！"