import { ATeamMCPServer } from './server.js';
import { logger } from '../utils/logger.js';

async function main() {
  try {
    const server = new ATeamMCPServer();
    await server.start();
  } catch (error) {
    logger.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

void main();
