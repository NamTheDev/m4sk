const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const client = new Client({
  intents: Object.values(GatewayIntentBits),
  partials: Object.values(Partials),
  shards: "auto",
  allowedMentions: {
    repliedUser: false
  }
});
const config = require("./src/config.js");
const { readdirSync } = require("node:fs");
const { join } = require("path");

const commands = new Collection()
const commandFolders = readdirSync('src/commands')
for (const commandFolder of commandFolders) {
  const commandFiles = readdirSync(`src/commands/${commandFolder}`)
  for (const commandFile of commandFiles) {
    const command = require(join(process.cwd(), 'src', 'commands', commandFolder, commandFile))
    const { data } = command
    const { name } = data
    commands.set(name, data)
  }
}
config.rest.setToken(config.token)
module.exports = { client, commands }

readdirSync("src/events").forEach(async (file) => await require(join(process.cwd(), 'src', 'events', file)))

client.login(config.token);