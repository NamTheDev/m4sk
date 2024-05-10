const { readdirSync } = require("node:fs");

module.exports = {
  execute: async () => {
    const eventFiles = readdirSync("./src/events");
    eventFiles.forEach(async (file) => require(`../events/${file}`))
  }
}