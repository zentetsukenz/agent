/**
 * Server Entry Point
 */

const app = require("./app");
const config = require("./config");

app.listen(config.port, () => {
  console.log(
    `🚀 Load Tester server running on http://localhost:${config.port}`
  );
  console.log(`📊 Environment: ${config.env}`);
  console.log(
    `🗄️  Database: ${config.database.url.replace(/\/.*\//, "/.../")}`
  );
});
