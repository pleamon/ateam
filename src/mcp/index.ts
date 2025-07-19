import { ATeamMCPServer } from './server.js';

async function main() {
    try {
        const server = new ATeamMCPServer();
        await server.start();
    } catch (error) {
        console.error('Failed to start MCP server:', error);
        process.exit(1);
    }
}

main(); 