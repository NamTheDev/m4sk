const { InteractionType } = require('discord.js');
const { handleCommandExecution, handleAutocomplete, handleComponentInteraction } = require('../utilities/interactionHandlers');

/**
 * Handles various types of interactions in Discord.
 * @module InteractionCreateEvent
 */
module.exports = {
    name: 'interactionCreate',
    /**
     * Executes the appropriate handler based on the interaction type.
     * @param {Interaction} interaction - The interaction object from Discord.js
     */
    async execute(interaction) {
        switch (interaction.type) {
            case InteractionType.ApplicationCommand:
                // Handle slash commands
                await handleCommandExecution(interaction);
                break;
            case InteractionType.ApplicationCommandAutocomplete:
                // Handle autocomplete requests for application commands
                await handleAutocomplete(interaction);
                break;
            case InteractionType.MessageComponent:
                // Handle interactions with message components (e.g., buttons, select menus)
                await handleComponentInteraction(interaction);
                break;
        }
    },
};