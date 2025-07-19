import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const createTeamMemberSchema = z.object({
    name: z.string().min(1, '名称不能为空'),
    workPrompt: z.string().optional(),
    responsibilities: z.array(z.string()),
    skills: z.array(z.string()),
});

export class TeamMemberService {
    /**
     * 获取所有团队成员
     */
    static async getAllTeamMembers() {
        const teamMembers = await prisma.teamMember.findMany();
        return teamMembers;
    }

    /**
     * 根据ID获取团队成员
     */
    static async getTeamMemberById(id: string) {
        const teamMember = await prisma.teamMember.findUnique({
            where: { id },
        });
        return teamMember;
    }

    /**
     * 创建团队成员
     */
    static async createTeamMember(teamId: string, teamMember: z.infer<typeof createTeamMemberSchema>) {
        try {
            const validatedData = createTeamMemberSchema.parse(teamMember);
            const newTeamMember = await prisma.teamMember.create({
                data: {
                    teamId,
                    name: validatedData.name,
                    workPrompt: validatedData.workPrompt,
                    responsibilities: validatedData.responsibilities,
                    skills: validatedData.skills,
                },
            });
            return newTeamMember;
        } catch (error) {
            throw new Error('创建团队成员失败');
        }
    }

    /**
     * 更新团队成员
     */
    static async updateTeamMember(id: string, teamMember: z.infer<typeof createTeamMemberSchema>) {
        try {
            const validatedData = createTeamMemberSchema.parse(teamMember);
            const updatedTeamMember = await prisma.teamMember.update({
                where: { id },
                data: {
                    name: validatedData.name,
                    workPrompt: validatedData.workPrompt,
                    responsibilities: validatedData.responsibilities,
                    skills: validatedData.skills,
                },
            });
            return updatedTeamMember;
        } catch (error) {
            throw new Error('更新团队成员失败');
        }
    }

    /**
     * 删除团队成员
     */
    static async deleteTeamMember(id: string) {
        const deletedTeamMember = await prisma.teamMember.delete({
            where: { id },
        });
        return deletedTeamMember;
    }

    /**
     * 获取团队成员
     */
    static async getTeamMembers(teamId: string) {
        const teamMembers = await prisma.teamMember.findMany({
            where: { teamId },
        });
        return teamMembers;
    }

    /**
     * 获取团队成员统计信息
     */
    static async getTeamMemberStats(teamId: string) {
        const [memberCount, taskCount, docCount] = await Promise.all([
            prisma.teamMember.count({ where: { teamId } }),
            prisma.task.count({ where: { teamId } }),
            prisma.documentation.count({ where: { teamId } }),
        ]);
        return { memberCount, taskCount, docCount };
    }

    /**
     * 获取团队成员工作记录
     */
    static async getTeamMemberWorklog(teamMemberId: string) {
        const teamMemberWorklog = await prisma.teamMemberWorklog.findMany({
            where: { teamMemberId },
        });
        return teamMemberWorklog;
    }

    /**
     * 获取团队成员任务
     */
    static async getTeamMemberTask(teamMemberId: string) {
        const teamMemberTask = await prisma.teamMemberTask.findMany({
            where: { teamMemberId },
        });
        return teamMemberTask;
    }

    /**
     * 获取团队成员活动
     */
    static async getTeamMemberActivity(teamMemberId: string) {
        const teamMemberActivity = await prisma.memberActivity.findMany({
            where: { teamMemberId },
        });
        return teamMemberActivity;
    }

    /**
     * 获取团队成员文档
     */
    static async getTeamMemberDocumentation(teamMemberId: string) {
        const teamMemberDocumentation = await prisma.documentation.findMany({
            where: { teamMemberId },
        });
        return teamMemberDocumentation;
    }
}