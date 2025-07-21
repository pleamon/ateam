import { ProjectMemberService } from './project-member.service';
import { prismaMock } from '../../test/setup';
import { mockProjectMember, mockProject, mockUser, createMockProjectMember } from '../../test/fixtures';
import { ProjectRole } from '../../../generated/prisma';

// Import setup
import '../../test/setup';

describe('ProjectMemberService', () => {
  describe('getProjectMembers', () => {
    it('should return project members', async () => {
      const members = [{
        ...mockProjectMember,
        user: mockUser,
        project: mockProject,
      }];
      prismaMock.projectMember.findMany.mockResolvedValue(members);

      const result = await ProjectMemberService.getProjectMembers('project-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(members);
      expect(prismaMock.projectMember.findMany).toHaveBeenCalledWith({
        where: { projectId: 'project-1' },
        include: {
          user: {
            select: expect.any(Object),
          },
          project: true,
        },
        orderBy: {
          joinedAt: 'desc',
        },
      });
    });

    it('should handle errors', async () => {
      prismaMock.projectMember.findMany.mockRejectedValue(new Error('Database error'));

      await expect(ProjectMemberService.getProjectMembers('project-1'))
        .rejects.toThrow('获取项目成员列表失败');
    });
  });

  describe('getUserProjects', () => {
    it('should return user projects', async () => {
      const memberships = [{
        ...mockProjectMember,
        project: mockProject,
      }];
      prismaMock.projectMember.findMany.mockResolvedValue(memberships);

      const result = await ProjectMemberService.getUserProjects('user-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(memberships);
      expect(prismaMock.projectMember.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { project: true },
        orderBy: { joinedAt: 'desc' },
      });
    });
  });

  describe('getProjectMember', () => {
    it('should return project member details', async () => {
      const member = {
        ...mockProjectMember,
        user: mockUser,
        project: mockProject,
      };
      prismaMock.projectMember.findUnique.mockResolvedValue(member);

      const result = await ProjectMemberService.getProjectMember('project-1', 'user-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(member);
    });

    it('should throw error when member not found', async () => {
      prismaMock.projectMember.findUnique.mockResolvedValue(null);

      await expect(ProjectMemberService.getProjectMember('project-1', 'user-1'))
        .rejects.toThrow('获取项目成员详情失败');
    });
  });

  describe('addProjectMember', () => {
    const addMemberData = {
      projectId: 'project-1',
      userId: 'user-2',
      role: ProjectRole.MEMBER,
      permissions: ['read', 'write'],
    };

    it('should add project member successfully', async () => {
      prismaMock.projectMember.findUnique.mockResolvedValue(null);
      prismaMock.project.findUnique.mockResolvedValue(mockProject);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      const newMember = createMockProjectMember('project-1', 'user-2');
      prismaMock.projectMember.create.mockResolvedValue({
        ...newMember,
        user: mockUser,
        project: mockProject,
      });

      const result = await ProjectMemberService.addProjectMember(addMemberData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('项目成员添加成功');
    });

    it('should throw error when user is already member', async () => {
      prismaMock.projectMember.findUnique.mockResolvedValue(mockProjectMember);

      await expect(ProjectMemberService.addProjectMember(addMemberData))
        .rejects.toThrow('用户已是项目成员');
    });

    it('should throw error when project not found', async () => {
      prismaMock.projectMember.findUnique.mockResolvedValue(null);
      prismaMock.project.findUnique.mockResolvedValue(null);

      await expect(ProjectMemberService.addProjectMember(addMemberData))
        .rejects.toThrow('项目不存在');
    });

    it('should throw error when user not found', async () => {
      prismaMock.projectMember.findUnique.mockResolvedValue(null);
      prismaMock.project.findUnique.mockResolvedValue(mockProject);
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(ProjectMemberService.addProjectMember(addMemberData))
        .rejects.toThrow('用户不存在');
    });
  });

  describe('batchAddMembers', () => {
    const batchData = {
      projectId: 'project-1',
      members: [
        { userId: 'user-2', role: ProjectRole.MEMBER, permissions: [] },
        { userId: 'user-3', role: ProjectRole.VIEWER, permissions: [] },
      ],
    };

    it('should batch add members successfully', async () => {
      prismaMock.project.findUnique.mockResolvedValue(mockProject);
      prismaMock.projectMember.findMany.mockResolvedValue([mockProjectMember]);
      prismaMock.projectMember.createMany.mockResolvedValue({ count: 2 });

      const result = await ProjectMemberService.batchAddMembers(batchData);

      expect(result.success).toBe(true);
      expect(result.data.count).toBe(2);
      expect(result.data.skipped).toBe(0);
      expect(result.message).toBe('成功添加 2 个成员');
    });

    it('should skip existing members', async () => {
      prismaMock.project.findUnique.mockResolvedValue(mockProject);
      prismaMock.projectMember.findMany.mockResolvedValue([
        mockProjectMember,
        createMockProjectMember('project-1', 'user-2'),
      ]);
      prismaMock.projectMember.createMany.mockResolvedValue({ count: 1 });

      const result = await ProjectMemberService.batchAddMembers(batchData);

      expect(result.data.count).toBe(1);
      expect(result.data.skipped).toBe(1);
    });

    it('should throw error when all users are already members', async () => {
      prismaMock.project.findUnique.mockResolvedValue(mockProject);
      prismaMock.projectMember.findMany.mockResolvedValue([
        mockProjectMember,
        createMockProjectMember('project-1', 'user-2'),
        createMockProjectMember('project-1', 'user-3'),
      ]);

      await expect(ProjectMemberService.batchAddMembers(batchData))
        .rejects.toThrow('所有用户都已是项目成员');
    });
  });

  describe('updateProjectMember', () => {
    const updateData = {
      role: ProjectRole.ADMIN,
      permissions: ['all'],
    };

    it('should update project member successfully', async () => {
      const updatedMember = {
        ...mockProjectMember,
        role: ProjectRole.ADMIN,
        permissions: ['all'],
        user: mockUser,
      };
      prismaMock.projectMember.update.mockResolvedValue(updatedMember);

      const result = await ProjectMemberService.updateProjectMember('project-1', 'user-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedMember);
      expect(result.message).toBe('项目成员更新成功');
    });
  });

  describe('removeProjectMember', () => {
    it('should remove project member successfully', async () => {
      const member = { ...mockProjectMember, role: ProjectRole.MEMBER };
      prismaMock.projectMember.findUnique.mockResolvedValue(member);
      prismaMock.projectMember.delete.mockResolvedValue(member);

      const result = await ProjectMemberService.removeProjectMember('project-1', 'user-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('项目成员移除成功');
    });

    it('should throw error when member not found', async () => {
      prismaMock.projectMember.findUnique.mockResolvedValue(null);

      await expect(ProjectMemberService.removeProjectMember('project-1', 'user-1'))
        .rejects.toThrow('项目成员不存在');
    });

    it('should throw error when removing last owner', async () => {
      prismaMock.projectMember.findUnique.mockResolvedValue(mockProjectMember);
      prismaMock.projectMember.count.mockResolvedValue(1);

      await expect(ProjectMemberService.removeProjectMember('project-1', 'user-1'))
        .rejects.toThrow('不能移除最后一个项目所有者');
    });

    it('should allow removing owner when there are other owners', async () => {
      prismaMock.projectMember.findUnique.mockResolvedValue(mockProjectMember);
      prismaMock.projectMember.count.mockResolvedValue(2);
      prismaMock.projectMember.delete.mockResolvedValue(mockProjectMember);

      const result = await ProjectMemberService.removeProjectMember('project-1', 'user-1');

      expect(result.success).toBe(true);
    });
  });

  describe('transferOwnership', () => {
    it('should transfer ownership successfully', async () => {
      const currentOwner = mockProjectMember;
      const targetMember = createMockProjectMember('project-1', 'user-2', {
        role: ProjectRole.MEMBER,
      });

      prismaMock.projectMember.findUnique
        .mockResolvedValueOnce(currentOwner)
        .mockResolvedValueOnce(targetMember);

      const updatedFrom = { ...currentOwner, role: ProjectRole.ADMIN };
      const updatedTo = { ...targetMember, role: ProjectRole.OWNER };

      prismaMock.$transaction.mockImplementation(async (callbacks) => {
        return Promise.all(callbacks.map(cb => cb));
      });
      prismaMock.projectMember.update
        .mockResolvedValueOnce(updatedFrom)
        .mockResolvedValueOnce(updatedTo);

      const result = await ProjectMemberService.transferOwnership('project-1', 'user-1', 'user-2');

      expect(result.success).toBe(true);
      expect(result.message).toBe('项目所有权转让成功');
    });

    it('should throw error when current user is not owner', async () => {
      const nonOwner = { ...mockProjectMember, role: ProjectRole.MEMBER };
      prismaMock.projectMember.findUnique.mockResolvedValueOnce(nonOwner);

      await expect(ProjectMemberService.transferOwnership('project-1', 'user-1', 'user-2'))
        .rejects.toThrow('只有项目所有者才能转让所有权');
    });

    it('should throw error when target user is not member', async () => {
      prismaMock.projectMember.findUnique
        .mockResolvedValueOnce(mockProjectMember)
        .mockResolvedValueOnce(null);

      await expect(ProjectMemberService.transferOwnership('project-1', 'user-1', 'user-2'))
        .rejects.toThrow('目标用户不是项目成员');
    });
  });

  describe('checkPermission', () => {
    it('should return true for owner regardless of permission', async () => {
      prismaMock.projectMember.findUnique.mockResolvedValue(mockProjectMember);

      const result = await ProjectMemberService.checkPermission('project-1', 'user-1', 'any-permission');

      expect(result.success).toBe(true);
      expect(result.hasPermission).toBe(true);
    });

    it('should check specific permission for non-owner', async () => {
      const member = { ...mockProjectMember, role: ProjectRole.MEMBER, permissions: ['read', 'write'] };
      prismaMock.projectMember.findUnique.mockResolvedValue(member);

      const result1 = await ProjectMemberService.checkPermission('project-1', 'user-1', 'read');
      expect(result1.hasPermission).toBe(true);

      const result2 = await ProjectMemberService.checkPermission('project-1', 'user-1', 'delete');
      expect(result2.hasPermission).toBe(false);
    });

    it('should return false when user is not member', async () => {
      prismaMock.projectMember.findUnique.mockResolvedValue(null);

      const result = await ProjectMemberService.checkPermission('project-1', 'user-1', 'read');

      expect(result.success).toBe(false);
      expect(result.hasPermission).toBe(false);
      expect(result.message).toBe('用户不是项目成员');
    });
  });

  describe('getProjectMemberStats', () => {
    it('should return project member statistics', async () => {
      prismaMock.projectMember.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(1)  // owners
        .mockResolvedValueOnce(2)  // admins
        .mockResolvedValueOnce(5)  // members
        .mockResolvedValueOnce(2); // viewers

      const result = await ProjectMemberService.getProjectMemberStats('project-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        total: 10,
        byRole: {
          owners: 1,
          admins: 2,
          members: 5,
          viewers: 2,
        },
      });
    });
  });
});