import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DomainKnowledgeService } from '../../services/documentation/domain-knowledge.service';

export default async function domainKnowledgeRoutes(fastify: FastifyInstance) {
    // 创建领域知识
    fastify.post('/domain-knowledge', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await DomainKnowledgeService.createDomainKnowledge(request.body as any);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '创建领域知识失败',
            });
        }
    });

    // 获取项目领域知识
    fastify.get('/projects/:projectId/domain-knowledge', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { projectId } = request.params as { projectId: string };
            const result = await DomainKnowledgeService.getProjectDomainKnowledge(projectId);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取项目领域知识失败',
            });
        }
    });

    // 根据ID获取领域知识
    fastify.get('/domain-knowledge/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await DomainKnowledgeService.getDomainKnowledgeById(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(404).send({
                success: false,
                error: error instanceof Error ? error.message : '获取领域知识详情失败',
            });
        }
    });

    // 更新领域知识
    fastify.put('/domain-knowledge/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await DomainKnowledgeService.updateDomainKnowledge(id, request.body as any);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '更新领域知识失败',
            });
        }
    });

    // 删除领域知识
    fastify.delete('/domain-knowledge/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await DomainKnowledgeService.deleteDomainKnowledge(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '删除领域知识失败',
            });
        }
    });
}