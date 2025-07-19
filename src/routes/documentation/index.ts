import { FastifyInstance } from 'fastify';
import documentationBaseRoutes from './documentation.routes';
import mindMapRoutes from './mindmap.routes';
import requirementsRoutes from './requirements.routes';
import domainKnowledgeRoutes from './domain-knowledge.routes';
import architectureRoutes from './architecture.routes';
import apiDesignRoutes from './api-design.routes';
import dataStructureRoutes from './data-structure.routes';

export default async function documentationRoutes(fastify: FastifyInstance) {
    // 注册所有子路由
    await fastify.register(documentationBaseRoutes);
    await fastify.register(mindMapRoutes);
    await fastify.register(requirementsRoutes);
    await fastify.register(domainKnowledgeRoutes);
    await fastify.register(architectureRoutes);
    await fastify.register(apiDesignRoutes);
    await fastify.register(dataStructureRoutes);
}