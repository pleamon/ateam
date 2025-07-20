import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PromptTemplateService } from '../../services/team/prompt-template.service';

export default async function promptTemplateRoutes(fastify: FastifyInstance) {
  // 获取所有提示词模板
  fastify.get('/prompt-templates', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { activeOnly } = request.query as { activeOnly?: string };
      const templates = await PromptTemplateService.getAllTemplates(activeOnly === 'true');
      return reply.send({
        success: true,
        data: templates,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: '获取提示词模板失败',
        error: error.message,
      });
    }
  });

  // 根据职责获取提示词模板
  fastify.get(
    '/prompt-templates/by-responsibility/:responsibility',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { responsibility } = request.params as { responsibility: string };
        const templates = await PromptTemplateService.getTemplatesByResponsibility(responsibility);
        return reply.send({
          success: true,
          data: templates,
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          message: '获取提示词模板失败',
          error: error.message,
        });
      }
    },
  );

  // 获取单个提示词模板
  fastify.get('/prompt-templates/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const template = await PromptTemplateService.getTemplateById(id);
      if (!template) {
        return reply.status(404).send({
          success: false,
          message: '提示词模板不存在',
        });
      }
      return reply.send({
        success: true,
        data: template,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: '获取提示词模板失败',
        error: error.message,
      });
    }
  });

  // 创建提示词模板
  fastify.post('/prompt-templates', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const template = await PromptTemplateService.createTemplate(request.body as any);
      return reply.send({
        success: true,
        data: template,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: '创建提示词模板失败',
        error: error.message,
      });
    }
  });

  // 更新提示词模板
  fastify.put('/prompt-templates/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const template = await PromptTemplateService.updateTemplate(id, request.body as any);
      return reply.send({
        success: true,
        data: template,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: '更新提示词模板失败',
        error: error.message,
      });
    }
  });

  // 删除提示词模板
  fastify.delete('/prompt-templates/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await PromptTemplateService.deleteTemplate(id);
      return reply.send({
        success: true,
        message: '删除成功',
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: '删除提示词模板失败',
        error: error.message,
      });
    }
  });

  // 初始化默认模板
  fastify.post(
    '/prompt-templates/initialize',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await PromptTemplateService.initializeDefaultTemplates();
        return reply.send({
          success: true,
          message: '初始化默认模板成功',
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          message: '初始化默认模板失败',
          error: error.message,
        });
      }
    },
  );
}
