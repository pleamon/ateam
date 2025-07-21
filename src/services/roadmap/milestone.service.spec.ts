import { MilestoneService } from './milestone.service';
import { prismaMock } from '../../test/setup';
import { mockMilestone, mockRoadmap, mockVersion, mockFeature, createMockMilestone, createMockVersion } from '../../test/fixtures';

// Import setup
import '../../test/setup';

describe('MilestoneService', () => {
  describe('getAllMilestones', () => {
    it('should return all milestones', async () => {
      const milestones = [{
        ...mockMilestone,
        roadmap: {
          ...mockRoadmap,
          project: { id: 'project-1', name: 'Test Project' },
        },
        versions: [],
      }];
      prismaMock.milestone.findMany.mockResolvedValue(milestones);

      const result = await MilestoneService.getAllMilestones();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(milestones);
      expect(prismaMock.milestone.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: {
          roadmap: {
            include: {
              project: true,
            },
          },
          versions: {
            include: {
              features: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });
    });

    it('should filter milestones by roadmapId', async () => {
      const milestones = [mockMilestone];
      prismaMock.milestone.findMany.mockResolvedValue(milestones);

      await MilestoneService.getAllMilestones('roadmap-1');

      expect(prismaMock.milestone.findMany).toHaveBeenCalledWith({
        where: { roadmapId: 'roadmap-1' },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });
  });

  describe('getMilestoneById', () => {
    it('should return milestone with full details', async () => {
      const milestoneWithDetails = {
        ...mockMilestone,
        roadmap: {
          ...mockRoadmap,
          project: { id: 'project-1', name: 'Test Project' },
        },
        versions: [{
          ...mockVersion,
          features: [mockFeature],
        }],
      };
      prismaMock.milestone.findUnique.mockResolvedValue(milestoneWithDetails);

      const result = await MilestoneService.getMilestoneById('milestone-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(milestoneWithDetails);
    });

    it('should throw error when milestone not found', async () => {
      prismaMock.milestone.findUnique.mockResolvedValue(null);

      await expect(MilestoneService.getMilestoneById('non-existent'))
        .rejects.toThrow('获取里程碑详情失败');
    });
  });

  describe('createMilestone', () => {
    const createData = {
      roadmapId: 'roadmap-1',
      name: 'Version 2.0',
      description: 'Major release',
      startDate: '2024-07-01T00:00:00Z',
      endDate: '2024-12-31T00:00:00Z',
      status: 'pending' as const,
    };

    it('should create milestone successfully', async () => {
      prismaMock.roadmap.findUnique.mockResolvedValue(mockRoadmap);
      const createdMilestone = createMockMilestone('roadmap-1', createData);
      prismaMock.milestone.create.mockResolvedValue({
        ...createdMilestone,
        roadmap: mockRoadmap,
      });

      const result = await MilestoneService.createMilestone(createData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('里程碑创建成功');
      expect(prismaMock.milestone.create).toHaveBeenCalledWith({
        data: {
          roadmapId: 'roadmap-1',
          name: 'Version 2.0',
          description: 'Major release',
          startDate: new Date('2024-07-01T00:00:00Z'),
          endDate: new Date('2024-12-31T00:00:00Z'),
          status: 'pending',
        },
        include: { roadmap: true },
      });
    });

    it('should throw error when end date is before start date', async () => {
      const invalidData = {
        ...createData,
        startDate: '2024-12-31T00:00:00Z',
        endDate: '2024-07-01T00:00:00Z',
      };

      await expect(MilestoneService.createMilestone(invalidData))
        .rejects.toThrow('结束日期必须晚于开始日期');
    });

    it('should throw error when roadmap not found', async () => {
      prismaMock.roadmap.findUnique.mockResolvedValue(null);

      await expect(MilestoneService.createMilestone(createData))
        .rejects.toThrow('路线图不存在');
    });
  });

  describe('updateMilestone', () => {
    const updateData = {
      name: 'Updated Milestone',
      status: 'in_progress' as const,
    };

    it('should update milestone successfully', async () => {
      const updatedMilestone = { ...mockMilestone, ...updateData };
      prismaMock.milestone.update.mockResolvedValue(updatedMilestone);

      const result = await MilestoneService.updateMilestone('milestone-1', updateData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('里程碑更新成功');
      expect(prismaMock.milestone.update).toHaveBeenCalledWith({
        where: { id: 'milestone-1' },
        data: updateData,
      });
    });

    it('should validate dates when updating', async () => {
      prismaMock.milestone.findUnique.mockResolvedValue(mockMilestone);
      const updateWithDates = {
        startDate: '2024-12-31T00:00:00Z',
        endDate: '2024-07-01T00:00:00Z',
      };

      await expect(MilestoneService.updateMilestone('milestone-1', updateWithDates))
        .rejects.toThrow('结束日期必须晚于开始日期');
    });
  });

  describe('deleteMilestone', () => {
    it('should delete milestone successfully', async () => {
      prismaMock.version.count.mockResolvedValue(0);
      prismaMock.milestone.delete.mockResolvedValue(mockMilestone);

      const result = await MilestoneService.deleteMilestone('milestone-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('里程碑删除成功');
    });

    it('should throw error when milestone has versions', async () => {
      prismaMock.version.count.mockResolvedValue(3);

      await expect(MilestoneService.deleteMilestone('milestone-1'))
        .rejects.toThrow('该里程碑下还有版本，无法删除');
    });
  });

  describe('updateMilestoneStatus', () => {
    it('should update milestone status', async () => {
      const updatedMilestone = { ...mockMilestone, status: 'completed' };
      prismaMock.milestone.update.mockResolvedValue(updatedMilestone);
      prismaMock.version.count.mockResolvedValue(0);

      const result = await MilestoneService.updateMilestoneStatus('milestone-1', 'completed');

      expect(result.success).toBe(true);
      expect(result.message).toBe('里程碑状态更新成功');
    });

    it('should check unreleased versions when marking as completed', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      prismaMock.milestone.update.mockResolvedValue(mockMilestone);
      prismaMock.version.count.mockResolvedValue(2);

      await MilestoneService.updateMilestoneStatus('milestone-1', 'completed');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('里程碑 milestone-1 被标记为完成，但还有 2 个版本未发布')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('getMilestoneProgress', () => {
    it('should calculate milestone progress correctly', async () => {
      const milestoneWithVersions = {
        ...mockMilestone,
        versions: [
          {
            ...mockVersion,
            status: 'released',
            features: [
              { ...mockFeature, status: 'completed' },
              { ...mockFeature, id: 'feature-2', status: 'completed' },
            ],
          },
          {
            ...createMockVersion('milestone-1'),
            status: 'development',
            features: [
              { ...mockFeature, id: 'feature-3', status: 'in_progress' },
              { ...mockFeature, id: 'feature-4', status: 'planned' },
            ],
          },
        ],
      };
      prismaMock.milestone.findUnique.mockResolvedValue(milestoneWithVersions);

      const result = await MilestoneService.getMilestoneProgress('milestone-1');

      expect(result.success).toBe(true);
      expect(result.data.progress).toMatchObject({
        versions: {
          total: 2,
          released: 1,
          percentage: 50,
        },
        features: {
          total: 4,
          completed: 2,
          percentage: 50,
        },
        time: {
          startDate: mockMilestone.startDate,
          endDate: mockMilestone.endDate,
          percentage: expect.any(Number),
          daysRemaining: expect.any(Number),
        },
      });
    });

    it('should handle empty milestone', async () => {
      const emptyMilestone = {
        ...mockMilestone,
        versions: [],
      };
      prismaMock.milestone.findUnique.mockResolvedValue(emptyMilestone);

      const result = await MilestoneService.getMilestoneProgress('milestone-1');

      expect(result.data.progress.versions.percentage).toBe(0);
      expect(result.data.progress.features.percentage).toBe(0);
    });

    it('should throw error when milestone not found', async () => {
      prismaMock.milestone.findUnique.mockResolvedValue(null);

      await expect(MilestoneService.getMilestoneProgress('non-existent'))
        .rejects.toThrow('里程碑不存在');
    });
  });

  describe('getProjectMilestones', () => {
    it('should return all milestones for a project', async () => {
      const milestones = [
        {
          ...mockMilestone,
          roadmap: mockRoadmap,
          _count: { versions: 3 },
        },
      ];
      prismaMock.milestone.findMany.mockResolvedValue(milestones);

      const result = await MilestoneService.getProjectMilestones('project-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(milestones);
      expect(prismaMock.milestone.findMany).toHaveBeenCalledWith({
        where: {
          roadmap: {
            projectId: 'project-1',
          },
        },
        include: {
          roadmap: true,
          _count: {
            select: {
              versions: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });
    });
  });

  describe('getMilestoneStats', () => {
    it('should return milestone statistics', async () => {
      prismaMock.milestone.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3)  // pending
        .mockResolvedValueOnce(5)  // in_progress
        .mockResolvedValueOnce(2)  // completed
        .mockResolvedValueOnce(0); // delayed

      const result = await MilestoneService.getMilestoneStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        total: 10,
        byStatus: {
          pending: 3,
          inProgress: 5,
          completed: 2,
          delayed: 0,
        },
      });
    });

    it('should filter stats by roadmapId', async () => {
      prismaMock.milestone.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0);

      await MilestoneService.getMilestoneStats('roadmap-1');

      expect(prismaMock.milestone.count).toHaveBeenCalledWith({
        where: { roadmapId: 'roadmap-1' },
      });
    });
  });
});