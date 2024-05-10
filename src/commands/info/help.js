const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const ms = require("ms");
const addDefaultEmbedSettings = require("../../utilFunctions/addDefaultEmbedSettings");
const { prefix } = require("../../config");

exports.commandBase = {
    name: "help",
    description: "Send a help menu.",
    cooldown: ms('10 seconds'),
    arguments: ["page"],
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
        if (args.length === 0 || !pages.find(({ name }) => name === args[0].trim().toLowerCase()))
            return message.channel.send({
                embeds: [guideEmbed]
            })
        const selectedPage = args[0]
        switch (selectedPage) {
            case "slash_commands":
            case "prefix_commands":
                const commands = selectedPage === 'prefix_commands' ? client.commands : client.slashCommands
                let index = 0;
                const options = commands.map(({ name }) => {
                    index += 1
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(name)
                        .setValue(index.toString())
                })
                options.push({
                    label: 'Original page',
                    value: (index+1).toString()
                })
                const ActionRow = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setPlaceholder('Select a command')
                            .setCustomId(`HELP|SELECT|${message.channel.id}|${message.author.id}|${selectedPage === 'prefix_commands' ? 'PREFIX' : 'SLASH'}`)
                            .setOptions(options)
                    )
                return await message.reply({ components: [ActionRow] })
        }
    },
    slashRun: async (client, interaction) => {

    }
}