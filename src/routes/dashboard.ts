import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DashboardService } from '../services/dashboard.service';
import { Controller, Get, Res, Body } from '@nestjs/common';


export default async function dashboardRoutes(fastify: FastifyInstance) {
  // 获取仪表盘统计数据
  fastify.get('/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await DashboardService.getDashboardStats();
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : '获取仪表盘统计数据失败',
      });
    }
  });

  // 获取项目仪表盘数据
  fastify.get(
    '/dashboard/projects/:projectId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { projectId } = request.params as { projectId: string };
        const result = await DashboardService.getProjectDashboard(projectId);
        return reply.send(result);
      } catch (error) {
        return reply.status(404).send({
          success: false,
          error: error instanceof Error ? error.message : '获取项目仪表盘数据失败',
        });
      }
    },
  );
}
