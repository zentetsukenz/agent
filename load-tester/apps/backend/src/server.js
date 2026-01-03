/**
 * Server Entry Point
 */

const app = require("./app");
const config = require("./config");
const logger = require("./utils/logger");
const { disconnectPrisma } = require("./config/database");

const server = app.listen(config.port, () => {
  logger.info(
    `🚀 Load Tester server running on http://localhost:${config.port}`
  );
  logger.info(`📊 Environment: ${config.env}`);
  logger.info(
    `🗄️  Database: ${config.database.url.replace(/\/.*\//, "/.../")}`
  );
});

/**
 * Graceful Shutdown Handler
 * Closes HTTP server and database connections before exiting
 */
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully...`);

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await disconnectPrisma();
      logger.info("Database connection closed");
      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown:", error);
      process.exit(1);
    }
  });

  // Force exit after timeout if graceful shutdown fails
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
