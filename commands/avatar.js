const { SlashCommandBuilder, EmbedBuilder, ALLOWED_SIZES } = require("discord.js");
const { SlashCommand } = require("../structures");
const { defaultEmbedColor } = require("../config");

module.exports = new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get avatar of a user.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get avatar of.')
        ),
    execute(interaction) {
        const userToGetAvatar = interaction.options.getUser('user') || interaction.user;
        const displayAvatarURL = userToGetAvatar.displayAvatarURL({ size: ALLOWED_SIZES[8] });
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(userToGetAvatar.username)
                    .setImage(displayAvatarURL)
                    .setColor(defaultEmbedColor)
            ]
        });
    }
})