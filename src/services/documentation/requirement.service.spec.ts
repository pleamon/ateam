import { RequirementService } from './requirement.service';
import { prismaMock } from '../../test/setup';
import { mockUser, mockProject } from '../../test/fixtures';
import { RequirementType, RequirementPriority, RequirementStatus, RequirementSource } from '../../../generated/prisma';

// Import setup
import '../../test/setup';

describe('RequirementService', () => {
  const mockRequirement = {
    id: 'req-1',
    projectId: 'project-1',
    title: 'User Authentication',
    content: 'Implement user authentication system',
    type: RequirementType.FUNCTIONAL,
    priority: RequirementPriority.HIGH,
    status: RequirementStatus.DRAFT,
    source: RequirementSource.CUSTOMER,
    parentId: null,
    assigneeId: 'user-1',
    createdBy: 'user-1',
    updatedBy: 'user-1',
    version: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  describe('getAllRequirements', () => {
    it('should return all requirements', async () => {
      const requirements = [{
        ...mockRequirement,
        project: mockProject,
        parent: null,
        children: [],
        assignee: mockUser,
        creator: mockUser,
        updater: mockUser,
        _count: { questions: 2, attachments: 1, children: 0 },
      }];
      prismaMock.requirement.findMany.mockResolvedValue(requirements);

      const result = await RequirementService.getAllRequirements();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(requirements);
      expect(prismaMock.requirement.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: expect.any(Object),
        orderBy: [
          { priority: 'asc' },
          { createdAt: 'desc' },
        ],
      });
    });

    it('should filter requirements by parameters', async () => {
      prismaMock.requirement.findMany.mockResolvedValue([]);

      await RequirementService.getAllRequirements('project-1', {
        type: RequirementType.FUNCTIONAL,
        priority: RequirementPriority.HIGH,
        status: RequirementStatus.CONFIRMED,
        source: RequirementSource.CUSTOMER,
        assigneeId: 'user-1',
        parentId: null,
      });

      expect(prismaMock.requirement.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          projectId: 'project-1',
          type: RequirementType.FUNCTIONAL,
          priority: RequirementPriority.HIGH,
          status: RequirementStatus.CONFIRMED,
          source: RequirementSource.CUSTOMER,
          assigneeId: 'user-1',
          parentId: null,
        },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });
  });

  describe('getRequirementById', () => {
    it('should return requirement with full details', async () => {
      const requirementWithDetails = {
        ...mockRequirement,
        project: mockProject,
        parent: null,
        children: [],
        assignee: mockUser,
        creator: mockUser,
        updater: mockUser,
        questions: [],
        attachments: [],
      };
      prismaMock.requirement.findFirst.mockResolvedValue(requirementWithDetails);

      const result = await RequirementService.getRequirementById('req-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(requirementWithDetails);
    });

    it('should throw error when requirement not found', async () => {
      prismaMock.requirement.findFirst.mockResolvedValue(null);

      await expect(RequirementService.getRequirementById('non-existent'))
        .rejects.toThrow('获取需求详情失败');
    });
  });

  describe('createRequirement', () => {
    const createData = {
      projectId: 'project-1',
      title: 'New Feature',
      content: 'Implement new feature',
      type: RequirementType.FUNCTIONAL,
      priority: RequirementPriority.MEDIUM,
      status: RequirementStatus.DRAFT,
      source: RequirementSource.PRODUCT,
      createdBy: 'user-1',
    };

    it('should create requirement successfully', async () => {
      const createdRequirement = {
        ...mockRequirement,
        ...createData,
        project: mockProject,
        parent: null,
        assignee: null,
        creator: mockUser,
      };
      prismaMock.requirement.create.mockResolvedValue(createdRequirement);

      const result = await RequirementService.createRequirement(createData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('需求创建成功');
      expect(prismaMock.requirement.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          updatedBy: createData.createdBy,
        },
        include: expect.any(Object),
      });
    });

    it('should create child requirement with parent validation', async () => {
      const createWithParent = { ...createData, parentId: 'req-parent' };
      prismaMock.requirement.findFirst.mockResolvedValue(mockRequirement);
      prismaMock.requirement.create.mockResolvedValue({
        ...mockRequirement,
        parentId: 'req-parent',
      });

      await RequirementService.createRequirement(createWithParent);

      expect(prismaMock.requirement.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'req-parent',
          deletedAt: null,
        },
      });
    });

    it('should throw error when parent requirement not found', async () => {
      const createWithParent = { ...createData, parentId: 'non-existent' };
      prismaMock.requirement.findFirst.mockResolvedValue(null);

      await expect(RequirementService.createRequirement(createWithParent))
        .rejects.toThrow('父需求不存在');
    });

    it('should handle invalid data', async () => {
      const invalidData = { ...createData, title: '' };

      await expect(RequirementService.createRequirement(invalidData))
        .rejects.toThrow('请求参数错误');
    });
  });

  describe('updateRequirement', () => {
    const updateData = {
      title: 'Updated Title',
      priority: RequirementPriority.LOW,
      updatedBy: 'user-2',
    };

    it('should update requirement successfully', async () => {
      const updatedRequirement = {
        ...mockRequirement,
        ...updateData,
        version: 2,
      };
      prismaMock.requirement.update.mockResolvedValue(updatedRequirement);

      const result = await RequirementService.updateRequirement('req-1', updateData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('需求更新成功');
      expect(prismaMock.requirement.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: {
          ...updateData,
          version: { increment: 1 },
        },
        include: expect.any(Object),
      });
    });
  });

  describe('deleteRequirement', () => {
    it('should soft delete requirement', async () => {
      prismaMock.requirement.count.mockResolvedValue(0);
      const deletedRequirement = {
        ...mockRequirement,
        deletedAt: new Date(),
      };
      prismaMock.requirement.update.mockResolvedValue(deletedRequirement);

      const result = await RequirementService.deleteRequirement('req-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('需求删除成功');
    });

    it('should throw error when requirement has children', async () => {
      prismaMock.requirement.count.mockResolvedValue(3);

      await expect(RequirementService.deleteRequirement('req-1'))
        .rejects.toThrow('该需求下还有子需求，无法删除');
    });
  });

  describe('updateRequirementStatus', () => {
    it('should update requirement status', async () => {
      const updatedRequirement = {
        ...mockRequirement,
        status: RequirementStatus.CONFIRMED,
      };
      prismaMock.requirement.update.mockResolvedValue(updatedRequirement);

      const result = await RequirementService.updateRequirementStatus(
        'req-1',
        RequirementStatus.CONFIRMED,
        'user-2'
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('需求状态更新成功');
    });
  });

  describe('assignRequirement', () => {
    it('should assign requirement to user', async () => {
      const assignedRequirement = {
        ...mockRequirement,
        assigneeId: 'user-2',
        assignee: { ...mockUser, id: 'user-2' },
      };
      prismaMock.requirement.update.mockResolvedValue(assignedRequirement);

      const result = await RequirementService.assignRequirement('req-1', 'user-2', 'user-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('需求分配成功');
    });
  });

  describe('getRequirementTree', () => {
    it('should return requirement tree structure', async () => {
      const treeData = [{
        ...mockRequirement,
        children: [{
          ...mockRequirement,
          id: 'req-2',
          parentId: 'req-1',
          children: [],
          _count: { questions: 0, attachments: 0 },
        }],
        _count: { questions: 1, attachments: 2 },
      }];
      prismaMock.requirement.findMany.mockResolvedValue(treeData);

      const result = await RequirementService.getRequirementTree('project-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(treeData);
      expect(prismaMock.requirement.findMany).toHaveBeenCalledWith({
        where: {
          projectId: 'project-1',
          parentId: null,
          deletedAt: null,
        },
        include: expect.objectContaining({
          children: expect.any(Object),
        }),
        orderBy: [
          { priority: 'asc' },
          { createdAt: 'asc' },
        ],
      });
    });
  });

  describe('getRequirementStats', () => {
    it('should return requirement statistics', async () => {
      prismaMock.requirement.count.mockResolvedValue(20);
      prismaMock.requirement.groupBy
        .mockResolvedValueOnce([
          { type: RequirementType.FUNCTIONAL, _count: 12 },
          { type: RequirementType.NON_FUNCTIONAL, _count: 5 },
          { type: RequirementType.BUSINESS, _count: 3 },
        ])
        .mockResolvedValueOnce([
          { priority: RequirementPriority.HIGH, _count: 8 },
          { priority: RequirementPriority.MEDIUM, _count: 10 },
          { priority: RequirementPriority.LOW, _count: 2 },
        ])
        .mockResolvedValueOnce([
          { status: RequirementStatus.DRAFT, _count: 5 },
          { status: RequirementStatus.CONFIRMED, _count: 10 },
          { status: RequirementStatus.IMPLEMENTED, _count: 5 },
        ])
        .mockResolvedValueOnce([
          { source: RequirementSource.CUSTOMER, _count: 12 },
          { source: RequirementSource.PRODUCT, _count: 6 },
          { source: RequirementSource.TECHNICAL, _count: 2 },
        ]);

      const result = await RequirementService.getRequirementStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        total: 20,
        byType: {
          FUNCTIONAL: 12,
          NON_FUNCTIONAL: 5,
          BUSINESS: 3,
        },
        byPriority: {
          HIGH: 8,
          MEDIUM: 10,
          LOW: 2,
        },
        byStatus: {
          DRAFT: 5,
          CONFIRMED: 10,
          IMPLEMENTED: 5,
        },
        bySource: {
          CUSTOMER: 12,
          PRODUCT: 6,
          TECHNICAL: 2,
        },
      });
    });
  });
});