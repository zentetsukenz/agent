/**
 * Server Entry Point
 */

const app = require("./app");
const config = require("./config");
const logger = require("./utils/logger");

app.listen(config.port, () => {
  logger.info(
    `🚀 Load Tester server running on http://localhost:${config.port}`
  );
  logger.info(`📊 Environment: ${config.env}`);
  logger.info(
    `🗄️  Database: ${config.database.url.replace(/\/.*\//, "/.../")}`
  );
});
