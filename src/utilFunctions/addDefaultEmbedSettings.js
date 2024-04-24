const { EmbedBuilder, Message, CommandInteraction, Client, Colors, Embed } = require('discord.js')

/**
 * 
 * @param {EmbedBuilder} embed 
 * @param {CommandInteraction | Message} messageOrInteraction
 * @param {Client} client
 */
module.exports = function addDefaultEmbedSettings(embed, messageOrInteraction, client) {
    embed.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL() })
    embed.setFooter({
        text: `Command replying to ${messageOrInteraction.author ? messageOrInteraction.author.username : messageOrInteraction.user.username}`,
        iconURL: messageOrInteraction.author ? messageOrInteraction.author.avatarURL() : messageOrInteraction.user.avatarURL()
    })
        .setTimestamp(Date.now())
    return embed
}