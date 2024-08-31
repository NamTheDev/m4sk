// Import required Discord.js classes and local modules
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } = require("discord.js");
const { SlashCommand } = require("../structures");
const { defaultEmbedColor } = require("../config");
const { readdirSync } = require("fs");

// Export a new SlashCommand instance
module.exports = new SlashCommand({
    // Define the command data using SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription('List of available commands.'),
    
    // Define the command execution function
    execute(interaction) {
        const embedFields = [];
        // Read all command files and map their data
        const commandsData = readdirSync('src/commands').map(command => require(`./${command}`).data);

        // Create embed fields for each command
        commandsData.forEach(command => {
            embedFields.push({
                name: command.name,
                value: `${command.description}`,
                inline: true
            });
        });

        // Create an embed with all commands
        const embed = new EmbedBuilder()
            .setTitle('Available Commands')
            .setColor(defaultEmbedColor)
            .addFields(embedFields);

        // Create select menu options for each command
        const selectMenuOptions = commandsData.map(command => ({
            label: command.name,
            description: command.description,
            value: command.name
        }));
        // Add an option to view all commands
        selectMenuOptions.push({
            label: 'All Commands',
            description: 'View all available commands.',
            value: 'all'
        });

        // Create the select menu component
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select-command')
            .setPlaceholder('Select a command...')
            .addOptions(selectMenuOptions);

        // Reply to the interaction with the embed and select menu
        interaction.reply({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(selectMenu)]
        });
    }
});