const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } = require("discord.js");
const { SlashCommand } = require("../structures");
const { defaultEmbedColor } = require("../config");
const { readdirSync } = require("fs");

module.exports = new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription('List of available commands.'),
    execute(interaction) {
        const embedFields = [];
        const commandsData = readdirSync('commands').map(command => require(`./${command}`).data);

        commandsData.forEach(command => {
            embedFields.push({
                name: command.name,
                value: `${command.description}`,
                inline: true
            });
        });

        const embed = new EmbedBuilder()
            .setTitle('Available Commands')
            .setColor(defaultEmbedColor)
            .addFields(embedFields);

        // Create select menu options
        const selectMenuOptions = commandsData.map(command => ({
            label: command.name,
            description: command.description,
            value: command.name
        }));

        // Create the select menu
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select-command')
            .setPlaceholder('Select a command...')
            .addOptions(selectMenuOptions);

        // Create a button to navigate back to homepage
        const homeButton = new ButtonBuilder()
            .setStyle('Primary')
            .setEmoji('🏠')
            .setCustomId('back-to-homepage')

        // Reply with the embed and the select menu
        interaction.reply({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(homeButton)]
        });
    }
});