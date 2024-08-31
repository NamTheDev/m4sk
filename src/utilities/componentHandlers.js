const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const { defaultEmbedColor } = require('../config');
const { fetchUrbanDictionarySearch } = require('./fetchDataFunctions');

/**
 * Handles the selection of a command from the command selection menu.
 * @param {Interaction} interaction - The interaction object from Discord.js
 */
async function handleSelectCommand(interaction) {
    const commands = interaction.client.commands;
    const selectedCommand = commands.get(interaction.values[0]);

    // If 'all' is selected, display all available commands
    if (!selectedCommand && interaction.values[0] === 'all') {
        // Create an array of embed fields for each command
        const embedFields = commands.map(command => ({
            name: command.data.name,
            value: command.data.description,
            inline: true,
        }));

        // Create an embed with all commands
        const embed = new EmbedBuilder()
            .setTitle('Available Commands')
            .setColor(defaultEmbedColor)
            .addFields(embedFields);

        // Update the interaction with the new embed
        return await interaction.update({
            embeds: [embed],
        });
    }

    // Construct the command embed with options if available
    // Map each option to a string representation
    const commandOptions = selectedCommand.data.options.map(({ name, type, options }) => {
        // If the option has sub-options, map them as well
        const subcommandOptions = options?.map(({ name, type }) => `${name} (${ApplicationCommandOptionType[type]})`).join(' & ') || '❌';
        return `${name} (${ApplicationCommandOptionType[type] || 'Subcommand'}) --> ${subcommandOptions}`;
    }).join('\n') || 'No options.';

    // Create an embed for the selected command
    const embed = new EmbedBuilder()
        .setTitle(selectedCommand.data.name)
        .setDescription(`${selectedCommand.data.description}\n\n**Options:**\`\`\`${commandOptions}\`\`\``)
        .setColor(defaultEmbedColor);

    // Update the interaction with the new embed
    await interaction.update({
        embeds: [embed],
    });
}

/**
 * Handles pagination for Urban Dictionary search results.
 * @param {Interaction} interaction - The interaction object from Discord.js
 */
async function handleUrbanDictionaryPagination(interaction) {
    // Extract the previous and next buttons from the message components
    const [previousButton, nextButton] = interaction.message.components[0].components;
    const oldEmbed = interaction.message.embeds[0];

    // Extract current page and search text from the embed footer
    const page = Number(oldEmbed.footer.text.split('/')[0].split('Page')[1].trim());
    const searchText = oldEmbed.footer.text.split('-')[1].trim();

    // Fetch the Urban Dictionary results for the given search text
    const results = await fetchUrbanDictionarySearch(searchText);

    // Determine the new page number based on which button was clicked
    const pageNumber = interaction.customId.includes('next') ? page + 1 : page - 1;
    const result = results[pageNumber - 1];

    // Destructure relevant details from the Urban Dictionary result
    const { word, definition, example, author, thumbs_up, thumbs_down, written_on, permalink } = result;

    // Create a new embed with updated page details
    const embed = new EmbedBuilder()
        .setTitle(`Search results for "${searchText}" on Urban Dictionary`)
        .setURL(permalink)
        .setDescription(`# ${word} (${author})\n- **Definition:**\n\`\`\`${definition}\`\`\`\n- **Example:**\n\`\`\`${example}\`\`\`\n### ${thumbs_up} 👍 ${thumbs_down} 👎`)
        .setColor(defaultEmbedColor)
        .setFooter({ text: `Page ${pageNumber} / ${results.length} - ${searchText}` })
        .setTimestamp(new Date(written_on));

    // Update the button states based on the current page
    previousButton.data.disabled = pageNumber === 1;
    nextButton.data.disabled = pageNumber === results.length;

    // Update the interaction with the new embed and button states
    await interaction.update({ embeds: [embed], components: interaction.message.components });
}

module.exports = {
    handleSelectCommand,
    handleUrbanDictionaryPagination
};