import { FastifyInstance } from 'fastify';
import documentationBaseRoutes from './documentation.routes';
import mindMapRoutes from './mindmap.routes';
import requirementsRoutes from './requirements.routes';
import domainKnowledgeRoutes from './domain-knowledge.routes';
import architectureRoutes from './architecture.routes';
import apiDesignRoutes from './api-design.routes';
import dataStructureRoutes from './data-structure.routes';

// 增强的路由（支持MCP格式）
import enhancedRequirementsRoutes from './enhanced-requirements.routes';
import enhancedArchitectureRoutes from './enhanced-architecture.routes';
import enhancedApiDesignRoutes from './enhanced-api-design.routes';
import enhancedMindmapRoutes from './enhanced-mindmap.routes';
import enhancedDomainKnowledgeRoutes from './enhanced-domain-knowledge.routes';
import enhancedDataStructureRoutes from './enhanced-data-structure.routes';

export default async function documentationRoutes(fastify: FastifyInstance) {
  // 注册所有子路由
  await fastify.register(documentationBaseRoutes);
  await fastify.register(mindMapRoutes);
  await fastify.register(requirementsRoutes);
  await fastify.register(domainKnowledgeRoutes);
  await fastify.register(architectureRoutes);
  await fastify.register(apiDesignRoutes);
  await fastify.register(dataStructureRoutes);
  
  // 注册增强的路由（v2版本）
  await fastify.register(enhancedRequirementsRoutes);
  await fastify.register(enhancedArchitectureRoutes);
  await fastify.register(enhancedApiDesignRoutes);
  await fastify.register(enhancedMindmapRoutes);
  await fastify.register(enhancedDomainKnowledgeRoutes);
  await fastify.register(enhancedDataStructureRoutes);
}
