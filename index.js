const { Client, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
  intents: Object.values(GatewayIntentBits),
  partials: Object.values(Partials),
  shards: "auto",
  allowedMentions: {
    repliedUser: false
  }
});
module.exports = client
const config = require("./src/config.js");
const { readdirSync } = require("node:fs");

readdirSync("./src/utils").forEach(async (file) => {
  const util = await require(`./src/utils/${file}`);
  util.execute(client);
});

client.login(config.token);