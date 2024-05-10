const { Collection, Events, InteractionType } = require("discord.js");
const cooldown = new Collection();
const config = require("../config.js");
const client = require("../../index.js");

client.on('interactionCreate', async (interaction) => {
    if (interaction.type == InteractionType.ApplicationCommand) {
      if (interaction.user.bot) return;

      try {
        const command = client.commands.get(interaction.commandName)
        if (command.ownerOnly && interaction.user.id !== config.owner) return interaction.reply({ content: "This command is only available for the owner of the bot.", ephemeral: true });
        if (command.cooldown) {
          if (cooldown.has(`${command.name}-${interaction.user.id}`)) {
            const nowDate = interaction.createdTimestamp;
            const waitedDate = cooldown.get(`${command.name}-${interaction.user.id}`) - nowDate;
            return interaction.reply({
              content: `Command on cooldown. Please try again <t:${Math.floor(new Date(nowDate + waitedDate).getTime() / 1000)}:R>.`,
              ephemeral: true
            }).then(() => setTimeout(() => interaction.deleteReply(), cooldown.get(`${command.name}-${interaction.user.id}`) - Date.now() - 1000));
          }
          command.execute(client, interaction);

          cooldown.set(`${command.name}-${interaction.user.id}`, Date.now() + command.cooldown);

          setTimeout(() => {
            cooldown.delete(`${command.name}-${interaction.user.id}`);
          }, command.cooldown + 1000);
        } else {
          command.execute(client, interaction)
        }
      } catch (e) {
        console.error(e)
        interaction.reply({ content: "An error occured while running the command. Please try again, later.", ephemeral: true })
      }
    } else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.autoComplete(client, interaction)
      } catch (e) {
        console.log(e)
      }
    }
  })
