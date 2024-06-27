const { EmbedBuilder, ApplicationCommandOptionType, SlashCommandStringOption, SlashCommandUserOption, ALLOWED_SIZES } = require("discord.js");
const ms = require("ms");
const addDefaultEmbedSettings = require("../../utilFunctions/addDefaultEmbedSettings");
const SlashCommand = require("../../structures/SlashCommand");

module.exports = new SlashCommand({
    data: {
        name: "avatar",
        description: "Get your avatar or other user's avatar.",
        cooldown: ms('3 seconds'),
        options: [
            new SlashCommandStringOption()
                .setName('type')
                .setDescription('Type of avatar (display or default).')
                .setChoices(...['display', 'default'].map(name => ({ name, value: name })))
                .setRequired(true),
            new SlashCommandUserOption()
                .setName('user')
                .setDescription('User to get avatar.')
        ]
    },
    ownerOnly: false,
    execute: async ({ interaction, client }) => {
        await interaction.deferReply()
        const type = interaction.options.getString('type')
        const user = interaction.options.getUser('user')
        const displayAvatar = user ? user.displayAvatarURL({ size: ALLOWED_SIZES['8'] }) : interaction.user.displayAvatarURL({ size: ALLOWED_SIZES['8'] })
        const defaultAvatar = user ? user.avatarURL({ size: ALLOWED_SIZES['8'] }) : interaction.user.avatarURL({ size: ALLOWED_SIZES['8'] })
        const avatarURL = type === 'display' ? displayAvatar : defaultAvatar
        await interaction.followUp(avatarURL)
    }
})