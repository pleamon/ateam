import { z } from 'zod';

export const createProjectDto = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    createdBy: z.string().optional(),
});

export type CreateProjectDto = z.infer<typeof createProjectDto>;
