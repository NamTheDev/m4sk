// Import required Discord.js classes
const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
} = require("discord.js");

// Import custom SlashCommand class
const { SlashCommand } = require("../structures");

// Import default embed color from config
const { defaultEmbedColor } = require("../config");

// Import utility functions for fetching data from various sources
const {
    fetchYoutubeSearchVideos,
    fetchGitHubSearch,
    fetchWikipediaSearch,
    fetchUrbanDictionarySearch,
} = require("../utilities/fetchDataFunctions");

// Define and export the search command
module.exports = new SlashCommand({
    // Set up the command using SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search anything you want on different sites and engines.")
        // Add subcommand for GitHub search
        .addSubcommand((subcommand) =>
            subcommand
                .setName("github")
                .setDescription("Search for GitHub repositories.")
                .addStringOption((option) =>
                    option
                        .setName("text")
                        .setDescription("The text to search for.")
                        .setRequired(true)
                )
        )
        // Add subcommand for Wikipedia search
        .addSubcommand((subcommand) =>
            subcommand
                .setName("wikipedia")
                .setDescription("Search for Wikipedia articles.")
                .addStringOption((option) =>
                    option
                        .setName("text")
                        .setDescription("The text to search for.")
                        .setRequired(true)
                )
        )
        // Add subcommand for Urban Dictionary search
        .addSubcommand((subcommand) =>
            subcommand
                .setName("urban-dictionary")
                .setDescription("Search for Urban Dictionary definitions.")
                .addStringOption((option) =>
                    option
                        .setName("text")
                        .setDescription("The text to search for.")
                        .setRequired(true)
                )
        )
        // Add subcommand for YouTube search
        .addSubcommand((subcommand) =>
            subcommand
                .setName("youtube")
                .setDescription("Search for YouTube videos.")
                .addStringOption((option) =>
                    option
                        .setName("text")
                        .setDescription("The text to search for.")
                        .setRequired(true)
                )
        ),
    // Define the execute function for the command
    async execute(interaction) {
        // Defer the reply to allow for longer processing time
        await interaction.deferReply();
        // Get the subcommand and search text from the interaction
        const subcommand = interaction.options.getSubcommand();
        const text = interaction.options.getString("text");

        try {
            // Handle different subcommands
            switch (subcommand) {
                case "youtube":
                    await handleYoutubeSearch(interaction, text);
                    break;
                case "github":
                    await handleGithubSearch(interaction, text);
                    break;
                case "wikipedia":
                    await handleWikipediaSearch(interaction, text);
                    break;
                case "urban-dictionary":
                    await handleUrbanDictionarySearch(interaction, text);
                    break;
                default:
                    // Handle invalid subcommand
                    interaction.followUp({
                        content: "Invalid subcommand.",
                        ephemeral: true,
                    });
            }
        } catch (error) {
            // Log and handle any errors
            console.error(error);
            interaction.followUp({
                content: "An error occurred while processing your request. Please try again later."
            });
        }
    },
});

// Helper functions to handle each subcommand

// Handle YouTube search
async function handleYoutubeSearch(interaction, text) {
    // Fetch YouTube search results
    const videos = await fetchYoutubeSearchVideos(text);
    // Create description from search results
    const description = (videos.slice(0, 20) || []).map(({ videoTitle, url }) => `[${videoTitle}](${url})`).join("\n") || "No result found.";
    // Create and send embed with search results
    const embed = createEmbed(`Search results for "${text}" on YouTube`, description);
    interaction.followUp({ embeds: [embed] });
}

// Handle GitHub search
async function handleGithubSearch(interaction, text) {
    // Fetch GitHub search results
    const results = await fetchGitHubSearch(text);
    // Create embed fields from search results
    const embedFields = results.map(({ title, description, url, language, followers, updated_date }) => ({
        name: title,
        value: `${description}\n- **Language**: ${language}\n- **Followers**: ${followers}\n[Redirect to repository](${url})\n(Updated ${updated_date})`,
        inline: true,
    }));
    // Get the main language from search results
    const mainLanguage = getMainLanguage(results);
    // Create and send embed with search results
    const embed = createEmbed(`Search results for "${text}" on GitHub`, `**Additional information**\n- **Main language among the results**: ${mainLanguage}\n- **Number of results**: ${results.length}.\n\n**Results**`).addFields(embedFields);
    interaction.followUp({ embeds: [embed] });
}

// Handle Wikipedia search
async function handleWikipediaSearch(interaction, text) {
    // Fetch Wikipedia search results
    const results = await fetchWikipediaSearch(text);
    // Create description from search results
    const description = results.map(({ title, link }) => `[${title}](${link})`).join("\n") || "No result found.";
    // Create and send embed with search results
    const embed = createEmbed(`Search results for "${text}" on Wikipedia`, description);
    interaction.followUp({ embeds: [embed] });
}

// Handle Urban Dictionary search
async function handleUrbanDictionarySearch(interaction, text) {
    // Fetch Urban Dictionary search results
    const results = await fetchUrbanDictionarySearch(text);
    // Get the first result
    const [firstResult] = results;
    const { word, definition, example, author, thumbs_up, thumbs_down, written_on, permalink } = firstResult;
    // Create embed with the first search result
    const embed = createEmbed(
        `Search results for "${text}" on Urban Dictionary`,
        `# ${word} (${author})\n- **Definition:**\n\`\`\`${definition}\`\`\`\n- **Example:**\n\`\`\`${example}\`\`\`\n### ${thumbs_up} 👍 ${thumbs_down} 👎`
    )
        .setURL(permalink)
        .setFooter({ text: `Page 1 / ${results.length} - ${text}` })
        .setTimestamp(new Date(written_on));
    // Create action row with navigation buttons
    const actionRow = createActionRow();
    // Send embed and action row
    interaction.followUp({ embeds: [embed], components: [actionRow] });
}

// Utility functions

// Create a basic embed with title and description
function createEmbed(title, description) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(defaultEmbedColor);
}

// Create an action row with navigation buttons for Urban Dictionary results
function createActionRow() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("previous-urban-dictionary-result").setEmoji("◀️").setStyle("Primary").setDisabled(true),
        new ButtonBuilder().setCustomId("next-urban-dictionary-result").setEmoji("▶️").setStyle("Primary")
    );
}

// Get the most common language from GitHub search results
function getMainLanguage(results) {
    return results.sort((a, b) => results.filter((v) => v === a).length - results.filter((v) => v === b).length)[0].language;
}
