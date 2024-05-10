const { SlashCommandBuilder } = require("discord.js");
class SlashCommand {
    /**
     * 
     * @param {{data: SlashCommandBuilder, autoComplete: function (import("discord.js").Interaction): void, execute: function (import("discord.js").Interaction, string[]): void}} param0 
     * @returns 
     */
    constructor({
        data,
        autoComplete,
        execute,
        ownerOnly,
    }) {
        return { data, autoComplete, execute, ownerOnly }
    }
}
module.exports = SlashCommand