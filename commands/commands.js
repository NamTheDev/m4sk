const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
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
            .setPlaceholder('Choose a command')
            .addOptions(selectMenuOptions);

        // Create an action row and add the select menu to it
        const actionRow = new ActionRowBuilder().addComponents(selectMenu);

        // Reply with the embed and the select menu
        interaction.reply({
            embeds: [embed],
            components: [actionRow]
        });
    }
});