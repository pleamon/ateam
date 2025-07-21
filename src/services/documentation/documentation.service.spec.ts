import { DocumentationService } from './documentation.service';
import { prismaMock } from '../../test/setup';
import { mockDocumentation, mockProject, mockUser, createMockDocumentation } from '../../test/fixtures';
import { DocumentType, DocumentStatus, DocumentVisibility } from '../../../generated/prisma';

// Import setup
import '../../test/setup';

describe('DocumentationService', () => {
  describe('getAllDocumentations', () => {
    it('should return all documentations', async () => {
      const docs = [mockDocumentation];
      prismaMock.documentation.findMany.mockResolvedValue(docs);

      const result = await DocumentationService.getAllDocumentations();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(docs);
      expect(prismaMock.documentation.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: expect.any(Object),
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should filter documentations by parameters', async () => {
      const docs = [mockDocumentation];
      prismaMock.documentation.findMany.mockResolvedValue(docs);

      const filters = {
        type: DocumentType.TECHNICAL,
        status: DocumentStatus.PUBLISHED,
        visibility: DocumentVisibility.PUBLIC,
        category: 'api',
        userId: 'user-1',
      };

      const result = await DocumentationService.getAllDocumentations('project-1', filters);

      expect(result.success).toBe(true);
      expect(prismaMock.documentation.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          projectId: 'project-1',
          type: DocumentType.TECHNICAL,
          status: DocumentStatus.PUBLISHED,
          visibility: DocumentVisibility.PUBLIC,
          category: 'api',
          userId: 'user-1',
        },
        include: expect.any(Object),
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('getDocumentationById', () => {
    it('should return documentation with full details', async () => {
      const docWithDetails = {
        ...mockDocumentation,
        project: mockProject,
        User: mockUser,
        tags: [],
        comments: [],
        attachments: [],
        versions: [],
      };
      prismaMock.documentation.findFirst.mockResolvedValue(docWithDetails);

      const result = await DocumentationService.getDocumentationById('doc-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(docWithDetails);
      expect(prismaMock.documentation.findFirst).toHaveBeenCalledWith({
        where: { id: 'doc-1', deletedAt: null },
        include: expect.any(Object),
      });
    });

    it('should throw error when documentation not found', async () => {
      prismaMock.documentation.findFirst.mockResolvedValue(null);

      await expect(DocumentationService.getDocumentationById('non-existent'))
        .rejects.toThrow('获取文档详情失败');
    });
  });

  describe('createDocumentation', () => {
    const createData = {
      projectId: 'project-1',
      title: 'New Documentation',
      content: 'This is new documentation content',
      summary: 'Summary',
      type: DocumentType.TECHNICAL,
      status: DocumentStatus.DRAFT,
      visibility: DocumentVisibility.INTERNAL,
      category: 'backend',
      userId: 'user-1',
    };

    it('should create documentation successfully', async () => {
      const createdDoc = createMockDocumentation('project-1', 'user-1', createData);
      prismaMock.documentation.create.mockResolvedValue({
        ...createdDoc,
        project: mockProject,
        User: mockUser,
        tags: [],
      });
      prismaMock.documentVersion.create.mockResolvedValue({
        id: 'version-1',
        documentationId: createdDoc.id,
        version: '1.0.0',
        content: createData.content,
        changeLog: '初始版本',
        userId: 'user-1',
        createdAt: new Date(),
      });

      const result = await DocumentationService.createDocumentation(createData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('文档创建成功');
      expect(prismaMock.documentation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: 'project-1',
          title: 'New Documentation',
          content: 'This is new documentation content',
          version: '1.0.0',
        }),
        include: expect.any(Object),
      });
      expect(prismaMock.documentVersion.create).toHaveBeenCalled();
    });

    it('should throw error on invalid data', async () => {
      const invalidData = { ...createData, title: '' };

      await expect(DocumentationService.createDocumentation(invalidData))
        .rejects.toThrow('请求参数错误');
    });
  });

  describe('updateDocumentation', () => {
    const updateData = {
      title: 'Updated Title',
      content: 'Updated content',
      userId: 'user-1',
    };

    it('should update documentation and create new version', async () => {
      prismaMock.documentation.findFirst.mockResolvedValue(mockDocumentation);
      const updatedDoc = { ...mockDocumentation, ...updateData };
      prismaMock.documentation.update.mockResolvedValue({
        ...updatedDoc,
        project: mockProject,
        User: mockUser,
        tags: [],
      });
      prismaMock.documentVersion.create.mockResolvedValue({
        id: 'version-2',
        documentationId: mockDocumentation.id,
        version: '1.1.0',
        content: updateData.content,
        changeLog: '内容更新',
        userId: 'user-1',
        createdAt: new Date(),
      });

      const result = await DocumentationService.updateDocumentation('doc-1', updateData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('文档更新成功');
      expect(prismaMock.documentation.update).toHaveBeenCalledTimes(2); // Once for update, once for version
      expect(prismaMock.documentVersion.create).toHaveBeenCalled();
    });

    it('should update without creating version when content unchanged', async () => {
      prismaMock.documentation.findFirst.mockResolvedValue(mockDocumentation);
      const updateWithoutContent = { title: 'Updated Title', userId: 'user-1' };
      prismaMock.documentation.update.mockResolvedValue({
        ...mockDocumentation,
        title: 'Updated Title',
        project: mockProject,
        User: mockUser,
        tags: [],
      });

      await DocumentationService.updateDocumentation('doc-1', updateWithoutContent);

      expect(prismaMock.documentation.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.documentVersion.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteDocumentation', () => {
    it('should soft delete documentation', async () => {
      const deletedDoc = { ...mockDocumentation, deletedAt: new Date() };
      prismaMock.documentation.update.mockResolvedValue(deletedDoc);

      const result = await DocumentationService.deleteDocumentation('doc-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('文档删除成功');
      expect(prismaMock.documentation.update).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('publishDocumentation', () => {
    it('should publish documentation', async () => {
      const publishedDoc = {
        ...mockDocumentation,
        status: DocumentStatus.PUBLISHED,
        publishedAt: new Date(),
      };
      prismaMock.documentation.update.mockResolvedValue(publishedDoc);

      const result = await DocumentationService.publishDocumentation('doc-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('文档发布成功');
      expect(prismaMock.documentation.update).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
        data: {
          status: DocumentStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        },
      });
    });
  });

  describe('searchDocumentations', () => {
    it('should search documentations by query', async () => {
      const docs = [mockDocumentation];
      prismaMock.documentation.findMany.mockResolvedValue(docs);

      const result = await DocumentationService.searchDocumentations('test');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(docs);
      expect(prismaMock.documentation.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          projectId: undefined,
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { content: { contains: 'test', mode: 'insensitive' } },
            { summary: { contains: 'test', mode: 'insensitive' } },
            { category: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        include: expect.any(Object),
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('getDocumentationStats', () => {
    it('should return documentation statistics', async () => {
      prismaMock.documentation.count
        .mockResolvedValueOnce(20) // total
        .mockResolvedValueOnce(10) // draft
        .mockResolvedValueOnce(8)  // published
        .mockResolvedValueOnce(2); // archived

      prismaMock.documentation.groupBy
        .mockResolvedValueOnce([
          { type: DocumentType.OVERVIEW, _count: 5 },
          { type: DocumentType.TECHNICAL, _count: 10 },
          { type: DocumentType.DESIGN, _count: 5 },
        ])
        .mockResolvedValueOnce([
          { visibility: DocumentVisibility.PUBLIC, _count: 3 },
          { visibility: DocumentVisibility.INTERNAL, _count: 15 },
          { visibility: DocumentVisibility.PRIVATE, _count: 2 },
        ]);

      const result = await DocumentationService.getDocumentationStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        total: 20,
        byStatus: {
          draft: 10,
          published: 8,
          archived: 2,
        },
        byType: {
          OVERVIEW: 5,
          TECHNICAL: 10,
          DESIGN: 5,
        },
        byVisibility: {
          PUBLIC: 3,
          INTERNAL: 15,
          PRIVATE: 2,
        },
      });
    });
  });
});