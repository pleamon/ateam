import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TaskService } from '../services/task.service';

export default async function taskRoutes(fastify: FastifyInstance) {
    // 获取所有任务
    fastify.get('/tasks', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { projectId } = request.query as { projectId?: string };
            const result = await TaskService.getAllTasks(projectId);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取任务列表失败',
            });
        }
    });

    // 根据ID获取任务
    fastify.get('/tasks/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await TaskService.getTaskById(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(404).send({
                success: false,
                error: error instanceof Error ? error.message : '获取任务详情失败',
            });
        }
    });

    // 创建任务
    fastify.post('/tasks', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await TaskService.createTask(request.body as any);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '创建任务失败',
            });
        }
    });

    // 更新任务
    fastify.put('/tasks/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await TaskService.updateTask(id, request.body as any);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '更新任务失败',
            });
        }
    });

    // 删除任务
    fastify.delete('/tasks/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await TaskService.deleteTask(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '删除任务失败',
            });
        }
    });

    // 分配任务给团队成员
    fastify.post('/tasks/:id/assign', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const { teamMemberId } = request.body as { teamMemberId: string };
            const result = await TaskService.assignTask(id, teamMemberId);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '分配任务失败',
            });
        }
    });

    // 添加任务活动
    fastify.post('/tasks/:id/activities', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const { body } = request.body as { body: string };
            const result = await TaskService.addTaskActivity(id, body);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '添加活动记录失败',
            });
        }
    });

    // 获取项目任务
    fastify.get('/projects/:projectId/tasks', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { projectId } = request.params as { projectId: string };
            const result = await TaskService.getProjectTasks(projectId);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取项目任务失败',
            });
        }
    });

    // 获取任务统计信息
    fastify.get('/tasks/stats', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { projectId } = request.query as { projectId?: string };
            const result = await TaskService.getTaskStats(projectId);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取任务统计信息失败',
            });
        }
    });

    // 更新任务状态
    fastify.patch('/tasks/:id/status', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const { status } = request.body as { status: string };
            const result = await TaskService.updateTaskStatus(id, status);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '更新任务状态失败',
            });
        }
    });
}