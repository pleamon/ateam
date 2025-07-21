import { MindMapService } from './mindmap.service';
import { prismaMock } from '../../test/setup';
import { mockProject } from '../../test/fixtures';

// Import setup
import '../../test/setup';

describe('MindMapService', () => {
  const mockMindMap = {
    id: 'mindmap-1',
    projectId: 'project-1',
    content: JSON.stringify({
      nodes: [
        {
          id: 'node-1',
          text: 'Root Node',
          parentId: null,
          position: { x: 0, y: 0 },
        },
      ],
      version: '1.0',
      type: 'mindmap',
    }),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  describe('createMindMap', () => {
    const createData = {
      projectId: 'project-1',
      content: 'Test content',
      nodes: [
        {
          id: 'node-1',
          text: 'Root Node',
          parentId: null,
          position: { x: 0, y: 0 },
          style: { color: '#000000' },
        },
      ],
    };

    it('should create mindmap with nodes', async () => {
      prismaMock.mindMap.create.mockResolvedValue(mockMindMap);

      const result = await MindMapService.createMindMap(createData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('脑图创建成功');
      expect(prismaMock.mindMap.create).toHaveBeenCalledWith({
        data: {
          projectId: 'project-1',
          content: expect.stringContaining('"type":"mindmap"'),
        },
      });
    });

    it('should create mindmap with raw content', async () => {
      const dataWithoutNodes = {
        projectId: 'project-1',
        content: 'Raw mindmap content',
      };

      prismaMock.mindMap.create.mockResolvedValue({
        ...mockMindMap,
        content: 'Raw mindmap content',
      });

      const result = await MindMapService.createMindMap(dataWithoutNodes);

      expect(result.success).toBe(true);
      expect(prismaMock.mindMap.create).toHaveBeenCalledWith({
        data: {
          projectId: 'project-1',
          content: 'Raw mindmap content',
        },
      });
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        projectId: '',
        content: '',
      };

      await expect(MindMapService.createMindMap(invalidData))
        .rejects.toThrow('请求参数错误');
    });
  });

  describe('getProjectMindMap', () => {
    it('should return mindmap with parsed nodes', async () => {
      prismaMock.mindMap.findFirst.mockResolvedValue({
        ...mockMindMap,
        project: mockProject,
      });

      const result = await MindMapService.getProjectMindMap('project-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('nodes');
      expect(result.data).toHaveProperty('parsedContent');
      expect(prismaMock.mindMap.findFirst).toHaveBeenCalledWith({
        where: { projectId: 'project-1' },
        include: { project: true },
      });
    });

    it('should return raw content when JSON parsing fails', async () => {
      prismaMock.mindMap.findFirst.mockResolvedValue({
        ...mockMindMap,
        content: 'Invalid JSON content',
        project: mockProject,
      });

      const result = await MindMapService.getProjectMindMap('project-1');

      expect(result.success).toBe(true);
      expect(result.data).not.toHaveProperty('nodes');
      expect(result.data.content).toBe('Invalid JSON content');
    });

    it('should handle null mindmap', async () => {
      prismaMock.mindMap.findFirst.mockResolvedValue(null);

      const result = await MindMapService.getProjectMindMap('project-1');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('updateMindMap', () => {
    const updateData = {
      nodes: [
        {
          id: 'node-1',
          text: 'Updated Root Node',
          parentId: null,
          position: { x: 100, y: 100 },
        },
        {
          id: 'node-2',
          text: 'Child Node',
          parentId: 'node-1',
          position: { x: 200, y: 200 },
        },
      ],
    };

    it('should update mindmap with new nodes', async () => {
      const updatedMindMap = {
        ...mockMindMap,
        content: JSON.stringify({
          nodes: updateData.nodes,
          version: '1.0',
          type: 'mindmap',
        }),
      };

      prismaMock.mindMap.update.mockResolvedValue(updatedMindMap);

      const result = await MindMapService.updateMindMap('mindmap-1', updateData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('脑图更新成功');
      expect(prismaMock.mindMap.update).toHaveBeenCalledWith({
        where: { id: 'mindmap-1' },
        data: {
          content: expect.stringContaining('"text":"Updated Root Node"'),
        },
      });
    });

    it('should update with raw content', async () => {
      const updateWithContent = {
        content: 'Updated raw content',
      };

      prismaMock.mindMap.update.mockResolvedValue({
        ...mockMindMap,
        content: 'Updated raw content',
      });

      const result = await MindMapService.updateMindMap('mindmap-1', updateWithContent);

      expect(result.success).toBe(true);
      expect(prismaMock.mindMap.update).toHaveBeenCalledWith({
        where: { id: 'mindmap-1' },
        data: { content: 'Updated raw content' },
      });
    });
  });

  describe('deleteMindMap', () => {
    it('should delete mindmap successfully', async () => {
      prismaMock.mindMap.delete.mockResolvedValue(mockMindMap);

      const result = await MindMapService.deleteMindMap('mindmap-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('脑图删除成功');
      expect(prismaMock.mindMap.delete).toHaveBeenCalledWith({
        where: { id: 'mindmap-1' },
      });
    });

    it('should handle delete errors', async () => {
      prismaMock.mindMap.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(MindMapService.deleteMindMap('mindmap-1'))
        .rejects.toThrow('删除脑图失败');
    });
  });
});