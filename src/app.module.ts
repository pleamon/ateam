import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [
        DatabaseModule.forRoot(),
        ProjectsModule,
    ],
})
export class AppModule { }