const { Collection, SlashCommandBuilder } = require("discord.js");
const { readdirSync } = require("node:fs");

module.exports = {
  execute: async (client) => {
    client.commands = new Collection();
    client.slashDatas = [];

    // - Handlers -
    const commandFolders = await readdirSync("./src/commands");

    commandFolders.forEach(async (category) => {
      const commandFiles = await readdirSync(`./src/commands/${category}`);

      commandFiles.forEach((file) => {
        const command = require(`../commands/${category}/${file}`);
          client.slashDatas.push(command.data);
          client.commands.set(command.data.name, command);
      });
    });
  },
}
