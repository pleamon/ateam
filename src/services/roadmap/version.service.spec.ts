import { VersionService } from './version.service';
import { prismaMock } from '../../test/setup';
import { mockVersion, mockFeature, mockRoadmap } from '../../test/fixtures';

// Import setup
import '../../test/setup';

describe('VersionService', () => {
  describe('getAllVersions', () => {
    it('should return all versions', async () => {
      const versions = [{
        ...mockVersion,
        roadmap: mockRoadmap,
        features: [mockFeature],
        _count: { features: 1 },
      }];
      prismaMock.version.findMany.mockResolvedValue(versions);

      const result = await VersionService.getAllVersions();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(versions);
      expect(prismaMock.version.findMany).toHaveBeenCalledWith({
        include: {
          roadmap: true,
          features: {
            orderBy: {
              priority: 'desc',
            },
          },
          _count: {
            select: {
              features: true,
            },
          },
        },
        orderBy: {
          releaseDate: 'asc',
        },
      });
    });
  });

  describe('getVersionById', () => {
    it('should return version with stats', async () => {
      const version = {
        ...mockVersion,
        roadmap: mockRoadmap,
        features: [
          { ...mockFeature, status: 'completed' },
          { ...mockFeature, id: 'feature-2', status: 'in_development' },
        ],
      };
      prismaMock.version.findUnique.mockResolvedValue(version);

      const result = await VersionService.getVersionById('version-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...version,
        stats: {
          totalFeatures: 2,
          completedFeatures: 1,
          completionRate: 50,
        },
      });
    });

    it('should throw error when version not found', async () => {
      prismaMock.version.findUnique.mockResolvedValue(null);

      await expect(VersionService.getVersionById('non-existent'))
        .rejects.toThrow('获取版本详情失败');
    });
  });

  describe('createVersion', () => {
    const createData = {
      roadmapId: 'roadmap-1',
      name: 'v2.0.0',
      description: 'Major release',
      releaseDate: '2024-06-01T00:00:00Z',
      status: 'planned' as const,
    };

    it('should create version successfully', async () => {
      prismaMock.roadmap.findUnique.mockResolvedValue(mockRoadmap);
      prismaMock.version.findFirst.mockResolvedValue(null);
      prismaMock.version.create.mockResolvedValue({
        ...mockVersion,
        ...createData,
        roadmap: mockRoadmap,
      });

      const result = await VersionService.createVersion(createData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('版本创建成功');
      expect(prismaMock.version.create).toHaveBeenCalledWith({
        data: {
          roadmapId: createData.roadmapId,
          name: createData.name,
          description: createData.description,
          releaseDate: new Date(createData.releaseDate),
          status: createData.status,
        },
        include: {
          roadmap: true,
        },
      });
    });

    it('should throw error when roadmap not found', async () => {
      prismaMock.roadmap.findUnique.mockResolvedValue(null);

      await expect(VersionService.createVersion(createData))
        .rejects.toThrow('路线图不存在');
    });

    it('should throw error when version name already exists', async () => {
      prismaMock.roadmap.findUnique.mockResolvedValue(mockRoadmap);
      prismaMock.version.findFirst.mockResolvedValue(mockVersion);

      await expect(VersionService.createVersion(createData))
        .rejects.toThrow('该版本名称已存在');
    });

    it('should throw error when release date outside roadmap range', async () => {
      prismaMock.roadmap.findUnique.mockResolvedValue(mockRoadmap);
      prismaMock.version.findFirst.mockResolvedValue(null);

      const invalidData = {
        ...createData,
        releaseDate: '2025-01-01T00:00:00Z', // Outside roadmap end date
      };

      await expect(VersionService.createVersion(invalidData))
        .rejects.toThrow('发布日期必须在路线图时间范围内');
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        roadmapId: '',
        name: 'v2.0.0',
      };

      await expect(VersionService.createVersion(invalidData as any))
        .rejects.toThrow('请求参数错误');
    });
  });

  describe('updateVersion', () => {
    const updateData = {
      name: 'v2.0.0-beta',
      status: 'in_development' as const,
    };

    it('should update version successfully', async () => {
      prismaMock.version.findUnique.mockResolvedValue(mockVersion);
      prismaMock.version.findFirst.mockResolvedValue(null);
      prismaMock.version.update.mockResolvedValue({
        ...mockVersion,
        ...updateData,
      });

      const result = await VersionService.updateVersion('version-1', updateData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('版本更新成功');
      expect(prismaMock.version.update).toHaveBeenCalledWith({
        where: { id: 'version-1' },
        data: {
          name: updateData.name,
          description: undefined,
          releaseDate: undefined,
          status: updateData.status,
        },
      });
    });

    it('should throw error when version not found', async () => {
      prismaMock.version.findUnique.mockResolvedValue(null);

      await expect(VersionService.updateVersion('non-existent', updateData))
        .rejects.toThrow('版本不存在');
    });

    it('should throw error when new name already exists', async () => {
      prismaMock.version.findUnique.mockResolvedValue(mockVersion);
      prismaMock.version.findFirst.mockResolvedValue({
        ...mockVersion,
        id: 'version-2',
      });

      await expect(VersionService.updateVersion('version-1', updateData))
        .rejects.toThrow('该版本名称已存在');
    });
  });

  describe('deleteVersion', () => {
    it('should delete version successfully', async () => {
      prismaMock.feature.count.mockResolvedValue(0);
      prismaMock.version.delete.mockResolvedValue(mockVersion);

      const result = await VersionService.deleteVersion('version-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('版本删除成功');
      expect(prismaMock.version.delete).toHaveBeenCalledWith({
        where: { id: 'version-1' },
      });
    });

    it('should throw error when version has features', async () => {
      prismaMock.feature.count.mockResolvedValue(5);

      await expect(VersionService.deleteVersion('version-1'))
        .rejects.toThrow('该版本下还有功能特性，无法删除');
    });
  });

  describe('releaseVersion', () => {
    it('should release version successfully', async () => {
      prismaMock.feature.count.mockResolvedValue(0);
      prismaMock.version.update.mockResolvedValue({
        ...mockVersion,
        status: 'released',
        releaseDate: new Date(),
      });

      const result = await VersionService.releaseVersion('version-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('版本发布成功');
      expect(prismaMock.version.update).toHaveBeenCalledWith({
        where: { id: 'version-1' },
        data: {
          status: 'released',
          releaseDate: expect.any(Date),
        },
      });
    });

    it('should throw error when incomplete features exist', async () => {
      prismaMock.feature.count.mockResolvedValue(3);

      await expect(VersionService.releaseVersion('version-1'))
        .rejects.toThrow('还有 3 个功能未完成，无法发布版本');
    });
  });

  describe('updateVersionStatus', () => {
    it('should update version status', async () => {
      prismaMock.version.update.mockResolvedValue({
        ...mockVersion,
        status: 'testing',
      });

      const result = await VersionService.updateVersionStatus('version-1', 'testing');

      expect(result.success).toBe(true);
      expect(result.message).toBe('版本状态更新成功');
    });
  });

  describe('getVersionProgress', () => {
    it('should return version progress', async () => {
      const version = {
        ...mockVersion,
        releaseDate: new Date('2024-06-01'),
        features: [
          { ...mockFeature, status: 'completed' },
          { ...mockFeature, id: 'feature-2', status: 'in_development' },
          { ...mockFeature, id: 'feature-3', status: 'planned' },
        ],
      };
      prismaMock.version.findUnique.mockResolvedValue(version);

      const result = await VersionService.getVersionProgress('version-1');

      expect(result.success).toBe(true);
      expect(result.data.progress.percentage).toBeCloseTo(33.33, 2);
      expect(result.data.progress.features).toEqual({
        total: 3,
        planned: 1,
        in_development: 1,
        testing: 0,
        completed: 1,
        cancelled: 0,
      });
    });

    it('should handle version without release date', async () => {
      const version = {
        ...mockVersion,
        releaseDate: null,
        features: [],
      };
      prismaMock.version.findUnique.mockResolvedValue(version);

      const result = await VersionService.getVersionProgress('version-1');

      expect(result.success).toBe(true);
      expect(result.data.progress.daysRemaining).toBe(0);
      expect(result.data.progress.isOverdue).toBe(false);
    });
  });

  describe('getProjectVersions', () => {
    it('should return project versions', async () => {
      const versions = [{
        ...mockVersion,
        roadmap: mockRoadmap,
        _count: { features: 2 },
      }];
      prismaMock.version.findMany.mockResolvedValue(versions);

      const result = await VersionService.getProjectVersions('project-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(versions);
      expect(prismaMock.version.findMany).toHaveBeenCalledWith({
        where: {
          roadmap: {
            projectId: 'project-1',
          },
        },
        include: {
          roadmap: true,
          _count: {
            select: {
              features: true,
            },
          },
        },
        orderBy: {
          releaseDate: 'desc',
        },
      });
    });
  });

  describe('getRoadmapVersions', () => {
    it('should return roadmap versions', async () => {
      const versions = [{
        ...mockVersion,
        features: [mockFeature],
        _count: { features: 1 },
      }];
      prismaMock.version.findMany.mockResolvedValue(versions);

      const result = await VersionService.getRoadmapVersions('roadmap-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(versions);
      expect(prismaMock.version.findMany).toHaveBeenCalledWith({
        where: { roadmapId: 'roadmap-1' },
        include: {
          features: {
            orderBy: {
              priority: 'desc',
            },
          },
          _count: {
            select: {
              features: true,
            },
          },
        },
        orderBy: {
          releaseDate: 'asc',
        },
      });
    });
  });

  describe('getVersionStats', () => {
    it('should return version statistics', async () => {
      prismaMock.version.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3)  // planned
        .mockResolvedValueOnce(4)  // in_development
        .mockResolvedValueOnce(2)  // testing
        .mockResolvedValueOnce(1)  // released
        .mockResolvedValueOnce(0); // deprecated

      const result = await VersionService.getVersionStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        total: 10,
        byStatus: {
          planned: 3,
          in_development: 4,
          testing: 2,
          released: 1,
          deprecated: 0,
        },
      });
    });

    it('should return stats for specific roadmap', async () => {
      prismaMock.version.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await VersionService.getVersionStats('roadmap-1');

      expect(result.success).toBe(true);
      expect(prismaMock.version.count).toHaveBeenCalledWith({
        where: { roadmapId: 'roadmap-1' },
      });
    });
  });
});