import { UserService } from './user.service';
import { prismaMock } from '../../test/setup';
import { mockUser, mockAdmin, createMockUser, mockProjectMember } from '../../test/fixtures';
import { UserRole } from '../../../generated/prisma';
import * as bcrypt from 'bcryptjs';

// Import setup
import '../../test/setup';

describe('UserService', () => {
  describe('getAllUsers', () => {
    it('should return all active users by default', async () => {
      const users = [mockUser, mockAdmin];
      prismaMock.user.findMany.mockResolvedValue(users);

      const result = await UserService.getAllUsers();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(users);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: expect.any(Object),
      });
    });

    it('should return all users including inactive when specified', async () => {
      const users = [mockUser, { ...mockAdmin, isActive: false }];
      prismaMock.user.findMany.mockResolvedValue(users);

      const result = await UserService.getAllUsers(true);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(users);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {},
        select: expect.any(Object),
      });
    });

    it('should handle errors', async () => {
      prismaMock.user.findMany.mockRejectedValue(new Error('Database error'));

      await expect(UserService.getAllUsers()).rejects.toThrow('获取用户列表失败');
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await UserService.getUserById('user-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.any(Object),
      });
    });

    it('should throw error when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(UserService.getUserById('non-existent')).rejects.toThrow('获取用户详情失败');
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await UserService.getUserByEmail('test@example.com');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: expect.any(Object),
      });
    });

    it('should throw error when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(UserService.getUserByEmail('non@existent.com')).rejects.toThrow('获取用户失败');
    });
  });

  describe('createUser', () => {
    const createUserData = {
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
      name: 'New User',
    };

    it('should create a new user successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const createdUser = createMockUser({
        ...createUserData,
        password: 'hashed_password123',
      });
      prismaMock.user.create.mockResolvedValue(createdUser);

      const result = await UserService.createUser(createUserData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdUser);
      expect(result.message).toBe('用户创建成功');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw error when email already exists', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce(mockUser) // Email check
        .mockResolvedValueOnce(null); // Username check

      await expect(UserService.createUser(createUserData)).rejects.toThrow('邮箱已被注册');
    });

    it('should throw error when username already exists', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null) // Email check
        .mockResolvedValueOnce(mockUser); // Username check

      await expect(UserService.createUser(createUserData)).rejects.toThrow('用户名已被占用');
    });

    it('should throw error on invalid data', async () => {
      const invalidData = { ...createUserData, email: 'invalid-email' };

      await expect(UserService.createUser(invalidData)).rejects.toThrow('请求参数错误');
    });
  });

  describe('updateUser', () => {
    const updateData = {
      name: 'Updated Name',
      userId: 'user-1',
    };

    it('should update user successfully', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await UserService.updateUser('user-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedUser);
      expect(result.message).toBe('用户更新成功');
    });

    it('should throw error when updating email to existing one', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockAdmin);

      await expect(UserService.updateUser('user-1', { 
        email: 'admin@example.com'
      })).rejects.toThrow('邮箱已被其他用户使用');
    });

    it('should hash password when updating', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.update.mockResolvedValue(mockUser);

      await UserService.updateUser('user-1', { 
        password: 'newpassword'
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      const deletedUser = { ...mockUser, isActive: false };
      prismaMock.user.update.mockResolvedValue(deletedUser);

      const result = await UserService.deleteUser('user-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(deletedUser);
      expect(result.message).toBe('用户删除成功');
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { isActive: false },
      });
    });
  });

  describe('changePassword', () => {
    const changePasswordData = {
      oldPassword: 'password123',
      newPassword: 'newpassword123',
    };

    it('should change password successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ password: 'hashed_password123' });
      prismaMock.user.update.mockResolvedValue(mockUser);

      const result = await UserService.changePassword('user-1', changePasswordData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('密码修改成功');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password123');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });

    it('should throw error when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(UserService.changePassword('user-1', changePasswordData))
        .rejects.toThrow('用户不存在');
    });

    it('should throw error when old password is incorrect', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ password: 'hashed_wrongpassword' });

      await expect(UserService.changePassword('user-1', changePasswordData))
        .rejects.toThrow('原密码错误');
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login time', async () => {
      prismaMock.user.update.mockResolvedValue(mockUser);

      const result = await UserService.updateLastLogin('user-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('最后登录时间更新成功');
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { lastLoginAt: expect.any(Date) },
      });
    });
  });

  describe('getUserProjects', () => {
    it('should return user projects', async () => {
      const projectMembers = [{
        ...mockProjectMember,
        project: {
          id: 'project-1',
          name: 'Test Project',
          description: 'Test',
        },
      }];
      prismaMock.projectMember.findMany.mockResolvedValue(projectMembers);

      const result = await UserService.getUserProjects('user-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('role');
      expect(result.data[0]).toHaveProperty('permissions');
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      prismaMock.project.count.mockResolvedValue(5);
      prismaMock.projectMember.count.mockResolvedValue(10);
      prismaMock.session.count.mockResolvedValue(20);
      prismaMock.auditLog.count.mockResolvedValue(100);

      const result = await UserService.getUserStats('user-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        projectsCreated: 5,
        projectsJoined: 10,
        totalSessions: 20,
        totalAuditLogs: 100,
      });
    });
  });

  describe('validateUserPassword', () => {
    it('should validate user password successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await UserService.validateUserPassword('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('email');
      expect(result.data).not.toHaveProperty('password');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password123');
    });

    it('should throw error when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(UserService.validateUserPassword('test@example.com', 'password123'))
        .rejects.toThrow('用户不存在或已被禁用');
    });

    it('should throw error when user is inactive', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(UserService.validateUserPassword('test@example.com', 'password123'))
        .rejects.toThrow('用户不存在或已被禁用');
    });

    it('should throw error when password is incorrect', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(UserService.validateUserPassword('test@example.com', 'wrongpassword'))
        .rejects.toThrow('密码错误');
    });
  });
});