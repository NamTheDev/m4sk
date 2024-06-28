const { SlashCommandBuilder } = require("discord.js");
const { SlashCommand } = require("../structures");

module.exports = new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get avatar of a user.')
        .addRoleOption('')
})