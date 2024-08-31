// Import required Discord.js classes and local modules
const { SlashCommandBuilder, EmbedBuilder, ALLOWED_SIZES } = require("discord.js");
const { SlashCommand } = require("../structures");
const { defaultEmbedColor } = require("../config");

// Export a new SlashCommand instance
module.exports = new SlashCommand({
    // Define the command data using SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName('avatar')  // Set the name of the command
        .setDescription('Get avatar of a user.')  // Set the description of the command
        .addUserOption(option =>  // Add a user option to the command
            option
                .setName('user')  // Set the name of the option
                .setDescription('The user to get avatar of.')  // Set the description of the option
        ),
    // Define the command execution function
    execute(interaction) {
        // Get the user to fetch avatar for (default to interaction user if not specified)
        const userToGetAvatar = interaction.options.getUser('user') || interaction.user;
        
        // Get the avatar URL with the largest allowed size
        // ALLOWED_SIZES is an array of allowed avatar sizes, we're using the largest (index 8)
        const displayAvatarURL = userToGetAvatar.displayAvatarURL({ size: ALLOWED_SIZES[8] });
        
        // Reply to the interaction with an embed containing the avatar
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(userToGetAvatar.username)  // Set the title of the embed to the user's name
                    .setURL(`https://discord.com/users/${interaction.user.id}`)  // Set a clickable URL to the user's Discord profile
                    .setImage(displayAvatarURL)  // Set the main image of the embed to the user's avatar
                    .setColor(defaultEmbedColor)  // Set the color of the embed using the default color from config
            ]
        });
    }
})