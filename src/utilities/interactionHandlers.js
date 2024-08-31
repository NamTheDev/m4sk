// Import required modules
const { consoleLog } = require('./consoleLog');
const { handleSelectCommand, handleUrbanDictionaryPagination } = require('./componentHandlers');

/**
 * Handles the execution of slash commands
 * @param {Interaction} interaction - The interaction object
 */
async function handleCommandExecution(interaction) {
    // Get the command and execute it if it exists
    const command = interaction.client.commands.get(interaction.commandName);
    command && await command.execute(interaction);
}

/**
 * Handles autocomplete interactions for slash commands
 * @param {Interaction} interaction - The interaction object
 */
async function handleAutocomplete(interaction) {
    try {
        // Get the command and execute autocomplete if it exists
        const command = interaction.client.commands.get(interaction.commandName);
        command && await command.autocomplete(interaction);
    } catch (error) {
        // Log any errors that occur during autocomplete
        await consoleLog(error);
    }
}

/**
 * Handles interactions with message components (buttons, select menus, etc.)
 * @param {Interaction} interaction - The interaction object
 */
async function handleComponentInteraction(interaction) {
    // Use a switch statement to handle different component interactions
    switch (interaction.customId) {
        case 'select-command':
            // Handle interactions with the command selection menu
            await handleSelectCommand(interaction);
            break;
        case 'previous-urban-dictionary-result':
        case 'next-urban-dictionary-result':
            // Handle interactions with Urban Dictionary pagination buttons
            await handleUrbanDictionaryPagination(interaction);
            break;
        // Add more cases for other component interactions as needed
        default:
            // Handle unknown component interactions
            console.log(`Unknown component interaction: ${interaction.customId}`);
    }
}

// Export the handler functions for use in other modules
module.exports = {
    handleCommandExecution,
    handleAutocomplete,
    handleComponentInteraction
};
