const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const ms = require("ms");
const addDefaultEmbedSettings = require("../../utilFunctions/addDefaultEmbedSettings");
const { prefix } = require("../../config");

exports.commandBase = {
    name: "help",
    description: "Send a help menu.",
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
        console.log(pages, args[0])
        if (args.length === 0 || !pages.find(({ name }) => name === args[0].trim().toLowerCase()))
            return message.channel.send({
                embeds: [guideEmbed]
            })
        const selectedPage = args[0]
        switch (selectedPage) {
            case "prefix_commands":
                const prefix_commands = []
                for (const data of client.commands) {
                    const { prefixData } = data[1]
                    const { name, description, aliases } = prefixData
                    prefix_commands.push({
                        commandName: prefixData
                    })
                }
                console.log(prefix_commands)
        }
    },
    slashRun: async (client, interaction) => {

    }
}