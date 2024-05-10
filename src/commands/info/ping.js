const { EmbedBuilder } = require("discord.js");
const ms = require("ms");
const addDefaultEmbedSettings = require("../../utilFunctions/addDefaultEmbedSettings");

exports.commandBase = {
  name: "ping",
  description: "Returns client and websocket ping.",
  aliases: ["pong"],
  cooldown: ms('5 seconds'),
  ownerOnly: false,
  prefixRun: async (client, message, args) => {
    const reply = await message.reply(`**M4sk** is thinking...`)
    const ping = reply.createdTimestamp - message.createdTimestamp;
    const clientPing = client.ws.ping;

    const embed = addDefaultEmbedSettings(new EmbedBuilder(), message, client)
    if (ping + clientPing > 300) embed.setColor('Red'); else embed.setColor('Green')
    embed
      .setTitle(`Pong! 🏓`)
      .addFields({
        name: 'Client',
        value: `${ping}ms`,
        inline: true
      }, {
        name: 'Websocket',
        value: `${clientPing}ms`,
        inline: true
      })
    reply.edit({
      content: "_ _",
      embeds: [embed]
    })
  },
  slashRun: async (client, interaction) => {
    interaction.deferReply()
    const reply = await interaction.fetchReply();
    const ping = reply.createdTimestamp - interaction.createdTimestamp;
    const clientPing = client.ws.ping;

    const embed = addDefaultEmbedSettings(new EmbedBuilder(), interaction, client)
    if (ping + clientPing > 300) embed.setColor('Red'); else embed.setColor('Green')
    embed
      .setTitle(`Pong! 🏓`)
      .addFields({
        name: 'Client',
        value: `${ping}ms`,
        inline: true
      }, {
        name: 'Websocket',
        value: `${clientPing}ms`,
        inline: true
      })
    interaction.followUp({
      embeds: [embed]
    })
  }
}
