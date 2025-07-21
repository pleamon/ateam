import { UserRole, ProjectRole, DocumentType, DocumentStatus, DocumentVisibility } from '../../generated/prisma';

// User fixtures
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashed_password123',
  name: 'Test User',
  avatar: 'https://example.com/avatar.png',
  role: UserRole.USER,
  isActive: true,
  lastLoginAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockAdmin = {
  ...mockUser,
  id: 'admin-1',
  email: 'admin@example.com',
  username: 'admin',
  role: UserRole.ADMIN,
};

// Session fixtures
export const mockSession = {
  id: 'session-1',
  userId: 'user-1',
  token: 'test-token-123',
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0',
  expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const expiredSession = {
  ...mockSession,
  id: 'session-2',
  expiresAt: new Date(Date.now() - 86400000), // 24 hours ago
};

// Project fixtures
export const mockProject = {
  id: 'project-1',
  name: 'Test Project',
  description: 'A test project',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  createdBy: 'user-1',
};

// ProjectMember fixtures
export const mockProjectMember = {
  id: 'member-1',
  projectId: 'project-1',
  userId: 'user-1',
  role: ProjectRole.OWNER,
  permissions: ['all'],
  joinedAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Documentation fixtures
export const mockDocumentation = {
  id: 'doc-1',
  projectId: 'project-1',
  title: 'Test Documentation',
  content: 'This is test content',
  summary: 'Test summary',
  type: DocumentType.OVERVIEW,
  status: DocumentStatus.DRAFT,
  visibility: DocumentVisibility.INTERNAL,
  category: 'general',
  url: null,
  userId: 'user-1',
  version: '1.0.0',
  versionNumber: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  publishedAt: null,
  deletedAt: null,
};

// Milestone fixtures
export const mockRoadmap = {
  id: 'roadmap-1',
  projectId: 'project-1',
  name: 'Test Roadmap',
  description: 'Test roadmap description',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockMilestone = {
  id: 'milestone-1',
  roadmapId: 'roadmap-1',
  name: 'Version 1.0',
  description: 'First major release',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-06-30'),
  status: 'in_progress',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Version fixtures
export const mockVersion = {
  id: 'version-1',
  roadmapId: 'roadmap-1',
  name: 'v1.0.0',
  description: 'The first release',
  releaseDate: new Date('2024-03-01'),
  status: 'planned',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Feature fixtures
export const mockFeature = {
  id: 'feature-1',
  versionId: 'version-1',
  name: 'User Authentication',
  description: 'Implement user authentication',
  priority: 'high',
  status: 'in_progress',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Team fixtures
export const mockTeam = {
  id: 'team-1',
  name: 'Test Team',
  description: 'Test team description',
  projectId: 'project-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

// Document Tag fixtures
export const mockDocumentTag = {
  id: 'tag-1',
  name: 'important',
  description: 'Important documents',
  color: '#ff0000',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Test data generators
export function createMockUser(overrides = {}) {
  return {
    ...mockUser,
    id: `user-${Date.now()}`,
    ...overrides,
  };
}

export function createMockSession(userId: string, overrides = {}) {
  return {
    ...mockSession,
    id: `session-${Date.now()}`,
    userId,
    token: `token-${Date.now()}`,
    ...overrides,
  };
}

export function createMockProjectMember(projectId: string, userId: string, overrides = {}) {
  return {
    ...mockProjectMember,
    id: `member-${Date.now()}`,
    projectId,
    userId,
    ...overrides,
  };
}

export function createMockDocumentation(projectId: string, userId: string, overrides = {}) {
  return {
    ...mockDocumentation,
    id: `doc-${Date.now()}`,
    projectId,
    userId,
    ...overrides,
  };
}

export function createMockMilestone(roadmapId: string, overrides = {}) {
  return {
    ...mockMilestone,
    id: `milestone-${Date.now()}`,
    roadmapId,
    ...overrides,
  };
}

export function createMockVersion(roadmapId: string, overrides = {}) {
  return {
    ...mockVersion,
    id: `version-${Date.now()}`,
    roadmapId,
    ...overrides,
  };
}