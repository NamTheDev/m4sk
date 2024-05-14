const { EmbedBuilder, SlashCommandSubcommandBuilder, ApplicationCommandOptionType } = require("discord.js");
const ms = require("ms");
const addDefaultEmbedSettings = require("../../utilFunctions/addDefaultEmbedSettings");
const { prefix } = require("../../config");
const SlashCommand = require("../../structures/SlashCommand");
const { rest } = require("../../..");

module.exports = new SlashCommand({
    data: {
        name: "help",
        description: "Details about the bot.",
        cooldown: ms('10 seconds'),
        options: [
            new SlashCommandSubcommandBuilder()
                .setName('commands')
                .setDescription("Details about bot's commands.")
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Search by the name of the command.')
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        ]
    },
    ownerOnly: false,
    autoComplete: async ({ interaction, client }) => {
        const focusedValue = interaction.options.getFocused();
        const commandNames = client.commands.map(({ data }) => data.name).map(choice => ({ name: choice, value: choice }));
        commandNames.push({
            name: 'Show all',
            value: 'all'
        })
        if (!focusedValue) return await interaction.respond(commandNames)
        const filtered = commandNames.filter(({ name, value }) => name.startsWith(focusedValue) || value === 'all');
        await interaction.respond(
            filtered
        );
    },
    execute: async ({ interaction, client }) => {
        await interaction.deferReply()
        const embed = addDefaultEmbedSettings(new EmbedBuilder(), interaction, client)
        const commandName = interaction.options.getString('name')
        if (commandName === 'all') {
            const commandData = await rest.get(`/applications/${client.user.id}/commands`)
            embed
                .setTitle('All commands')
                .setDescription(commandData.map(({ id, name, options }) => {
                    if (options) {
                        const subCommands = options
                            .filter(option => option.type === ApplicationCommandOptionType.Subcommand)
                            .map((subCommand) => `</${name} ${subCommand.name}:${id}>`)
                            .join('\n')
                        return subCommands
                    } else return `</${name}:${id}>`
                }).join('\n'))
        } else {
            const { name, description, options, id } = (await rest.get(`/applications/${client.user.id}/commands`)).find(({ name }) => name === commandName)
            const subCommands = options ? options
                .filter(option => option.type === ApplicationCommandOptionType.Subcommand)
                .map(({ name }) => name) : []
            const commandOptions = options ? options
                .filter(option => option.type !== ApplicationCommandOptionType.Subcommand)
                .map(({ name }) => name) : []

            embed
                .setTitle(name)
                .setDescription(description)
                .setFields({
                    name: 'Sub Commands',
                    value: subCommands.length > 0 ? subCommands.map(subCommand => `\`${subCommand}\``).join(', ') : "No aliases."
                }, {
                    name: 'Options',
                    value: commandOptions.length > 0 ? commandOptions.map(commandOption => `\`${commandOption}\``).join(', ') : "No options."
                }, {
                    name: 'Usage',
                    value: `\`\`\`/${name} ${subCommands.length > 0 ? subCommands.join(' ') : commandOptions.length > 0 ? commandOptions.join(' ') : ''}\`\`\``
                }, {
                    name: 'Mention',
                    value: `${subCommands.length > 0 ? subCommands.map(subCommandName => `</${name} ${subCommandName}:${id}>`).join('\n') : `</${name}:${id}>`}`
                })
                .setFooter({
                    text: `Use /help to view the help menu`
                })
        }
        return await interaction.followUp({ embeds: [embed] })
    }
})