const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const ms = require("ms");
const addDefaultEmbedSettings = require("../../utilFunctions/addDefaultEmbedSettings");
const { prefix } = require("../../config");

exports.commandBase = {
    prefixData: {
        name: "help"
    },
    slashData: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Send a help menu."),
    cooldown: ms('10 seconds'),
    ownerOnly: false,
    prefixRun: async (client, message, args) => {
        const pages = [
            {
                name: 'prefix_commands',
                value: 'Show available prefix commands'
            },
            {
                name: 'slash_commands',
                value: 'Show available slash commands'
            }
        ].map(page => ({ ...page, inline: true }))
        const guideEmbed = addDefaultEmbedSettings(new EmbedBuilder(), message, client)
            .setTitle('Help menu')
            .setDescription(`\`\`\`${prefix}help <page>\`\`\`Use the command above or the select menu below to display a page.\n### Available pages:`)
            .addFields(pages)
        if (args.length === 0)
            return message.channel.send({
                embeds: [guideEmbed]
            })

        const prefix_commands = []
        for (const command of client.commands) {
            prefix_commands.push(command)
        }
        const slash_commands = []
        for (const slash_commands of client.slashCommands) { }
    },
    slashRun: async (client, interaction) => {

    }
}