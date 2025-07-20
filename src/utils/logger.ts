import { FastifyInstance } from 'fastify';

class Logger {
  private fastifyLogger?: FastifyInstance['log'];

  setFastifyLogger(logger: FastifyInstance['log']) {
    this.fastifyLogger = logger;
  }

  info(message: string, ...args: unknown[]) {
    if (this.fastifyLogger) {
      this.fastifyLogger.info(message, ...args);
    } else {
      console.log(message, ...args);
    }
  }

  error(message: string, ...args: unknown[]) {
    if (this.fastifyLogger) {
      this.fastifyLogger.error(message, ...args);
    } else {
      console.error(message, ...args);
    }
  }

  warn(message: string, ...args: unknown[]) {
    if (this.fastifyLogger) {
      this.fastifyLogger.warn(message, ...args);
    } else {
      console.warn(message, ...args);
    }
  }

  debug(message: string, ...args: unknown[]) {
    if (this.fastifyLogger) {
      this.fastifyLogger.debug(message, ...args);
    } else {
      console.debug(message, ...args);
    }
  }
}

export const logger = new Logger();
