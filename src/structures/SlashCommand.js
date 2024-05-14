const { SlashCommandBuilder, Client } = require("discord.js");
class SlashCommand {
    /**
     * 
     * @param {{data: SlashCommandBuilder, autoComplete: function ({interaction: import("discord.js").Interaction, client: Client}): void, execute: function ({interaction: import("discord.js").Interaction, client: Client}): void}} param0 
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