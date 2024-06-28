const { SlashCommandBuilder, CommandInteraction } = require("discord.js");

/**
 * Class representing a slash command.
 */
class SlashCommand {
    /**
     * @param {{data: SlashCommandBuilder, execute: function(CommandInteraction): void, autocomplete?: function(CommandInteraction): void }} options - The command options.
     */
    constructor({ data, execute, autocomplete }) {
        /**
         * The command data.
         * @type {SlashCommandBuilder}
         */
        this.data = data;

        /**
         * The execute function.
         * @type {function(CommandInteraction): void}
         */
        this.execute = execute;

        /**
         * The autocomplete function.
         * @type {function(CommandInteraction): void | undefined}
         */
        this.autocomplete = autocomplete;
    }
}

module.exports = { SlashCommand };
