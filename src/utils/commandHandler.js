const { Collection, SlashCommandBuilder } = require("discord.js");
const { readdirSync } = require("node:fs");

module.exports = {
  execute: async (client) => {
    client.commands = new Collection();
    client.commandAliases = new Collection();
    client.slashCommands = new Collection();
    client.slashDatas = [];

    // - Handlers -
    const commandFolders = await readdirSync("./src/commands");

    await Promise.all(commandFolders.map(async (category) => {
      const commandFiles = await readdirSync(`./src/commands/${category}`);

      await Promise.all(commandFiles.map(async (file) => {
        const commands = await import(`../commands/${category}/${file}`);

        if (commands) {
          if (commands.commandBase) {
            // Prefix Command
            const prefixCommand = commands.commandBase;
            client.commands.set(prefixCommand.name, prefixCommand);

            if (prefixCommand.aliases && Array.isArray(prefixCommand.aliases)) {
              prefixCommand.aliases.forEach(alias => {
                client.commandAliases.set(alias, prefixCommand.name);
              });
            }
          }
          // Slash Command
          const slashCommand = commands.commandBase;
          const slashData = new SlashCommandBuilder()
          slashData.name = slashCommand.name
          slashData.description = slashCommand.description

          if (slashCommand.options)
            if (slashCommand.options.length > 0)
              slashData.options = slashCommand.options


          client.slashDatas.push(slashData);
          client.slashCommands.set(slashCommand.name, slashCommand);
        }
      }));
    }));
  },
}
