import { Controller, Post, Body, Get, HttpStatus, HttpCode, Inject } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/project.dto';

@Controller('projects')
export class ProjectsController {
    constructor(
        @Inject(ProjectsService) private readonly projectsService: ProjectsService
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createProjectDto: CreateProjectDto) {
        return await this.projectsService.create(createProjectDto);
    }

    @Get()
    async findAll() {
        return await this.projectsService.findAll();
    }
}
