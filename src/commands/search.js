const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
} = require("discord.js");
const { SlashCommand } = require("../structures");
const { defaultEmbedColor } = require("../config");
const {
    fetchYoutubeSearchVideos,
    fetchGitHubSearch,
    fetchWikipediaSearch,
    fetchUrbanDictionarySearch,
} = require("../utilities/fetchDataFunctions");

module.exports = new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search anything you want on different sites and engines.")
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
    async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        const text = interaction.options.getString("text");

        try {
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
                    interaction.followUp({
                        content: "Invalid subcommand.",
                        ephemeral: true,
                    });
            }
        } catch (error) {
            console.error(error);
            interaction.followUp({
                content: "An error occurred while processing your request. Please try again later."
            });
        }
    },
});

// Helper functions to handle each subcommand

async function handleYoutubeSearch(interaction, text) {
    const videos = await fetchYoutubeSearchVideos(text);
    const description = (videos.slice(0, 20) || []).map(({ videoTitle, url }) => `[${videoTitle}](${url})`).join("\n") || "No result found.";
    const embed = createEmbed(`Search results for "${text}" on YouTube`, description);
    interaction.followUp({ embeds: [embed] });
}

async function handleGithubSearch(interaction, text) {
    const results = await fetchGitHubSearch(text);
    const embedFields = results.map(({ title, description, url, language, followers, updated_date }) => ({
        name: title,
        value: `${description}\n- **Language**: ${language}\n- **Followers**: ${followers}\n[Redirect to repository](${url})\n(Updated ${updated_date})`,
        inline: true,
    }));
    const mainLanguage = getMainLanguage(results);
    const embed = createEmbed(`Search results for "${text}" on GitHub`, `**Additional information**\n- **Main language among the results**: ${mainLanguage}\n- **Number of results**: ${results.length}.\n\n**Results**`).addFields(embedFields);
    interaction.followUp({ embeds: [embed] });
}

async function handleWikipediaSearch(interaction, text) {
    const results = await fetchWikipediaSearch(text);
    const description = results.map(({ title, link }) => `[${title}](${link})`).join("\n") || "No result found.";
    const embed = createEmbed(`Search results for "${text}" on Wikipedia`, description);
    interaction.followUp({ embeds: [embed] });
}

async function handleUrbanDictionarySearch(interaction, text) {
    const results = await fetchUrbanDictionarySearch(text);
    const [firstResult] = results;
    const { word, definition, example, author, thumbs_up, thumbs_down, written_on, permalink } = firstResult;
    const embed = createEmbed(
        `Search results for "${text}" on Urban Dictionary`,
        `# ${word} (${author})\n- **Definition:**\n\`\`\`${definition}\`\`\`\n- **Example:**\n\`\`\`${example}\`\`\`\n### ${thumbs_up} 👍 ${thumbs_down} 👎`
    )
        .setURL(permalink)
        .setFooter({ text: `Page 1 / ${results.length} - ${text}` })
        .setTimestamp(new Date(written_on));
    const actionRow = createActionRow();
    interaction.followUp({ embeds: [embed], components: [actionRow] });
}

// Utility functions
function createEmbed(title, description) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(defaultEmbedColor);
}

function createActionRow() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("previous-urban-dictionary-result").setEmoji("◀️").setStyle("Primary"),
        new ButtonBuilder().setCustomId("next-urban-dictionary-result").setEmoji("▶️").setStyle("Primary")
    );
}

function getMainLanguage(results) {
    return results.sort((a, b) => results.filter((v) => v === a).length - results.filter((v) => v === b).length)[0].language;
}
