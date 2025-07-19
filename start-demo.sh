#!/bin/bash

echo "🚀 ATeam项目管理MCP工具演示"
echo "================================"

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    pnpm install
fi

# 生成Prisma客户端
echo "🔧 生成Prisma客户端..."
pnpm db:generate

# 检查是否有.env文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到.env文件"
    echo "请创建.env文件并配置DATABASE_URL"
    echo "示例:"
    echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/ateam?schema=public\""
    echo ""
    echo "是否继续启动服务器? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "📚 API文档: http://localhost:3000/docs"
echo "🏥 健康检查: http://localhost:3000/health"
echo ""

pnpm start:dev 