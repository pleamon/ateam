import { Injectable, Inject } from '@nestjs/common';
import { CreateProjectDto } from './dto/project.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ProjectsService {
    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService
    ) { }

    async create(createProjectDto: CreateProjectDto) {
        try {
            const result = await this.prisma.project.create({
                data: {
                    name: createProjectDto.name,
                    description: createProjectDto.description,
                    createdBy: createProjectDto.createdBy,
                },
            });

            return {
                success: true,
                data: result,
                message: '项目创建成功',
            };
        } catch (error) {
            throw error;
        }
    }

    async findAll() {
        try {
            const projects = await this.prisma.project.findMany({
                include: {
                    creator: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            tasks: true,
                            members: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return {
                success: true,
                data: projects,
                message: '获取项目列表成功',
            };
        } catch (error) {
            throw error;
        }
    }
}
