const { EmbedBuilder } = require("discord.js");
const ms = require("ms");
const addDefaultEmbedSettings = require("../../utilFunctions/addDefaultEmbedSettings");
const SlashCommand = require("../../structures/SlashCommand");

module.exports = new SlashCommand({
  data: {
    name: "ping",
    description: "Returns client and websocket ping.",
    cooldown: ms('5 seconds'),
  },
  ownerOnly: false,
  execute: async ({ interaction, client }) => {
    const reply = await interaction.deferReply()
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
      content: "_ _",
      embeds: [embed]
    })
  }
})