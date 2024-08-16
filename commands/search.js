const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Embed } = require("discord.js");
const urbanDictionary = require('@dmzoneill/urban-dictionary');
const { SlashCommand } = require("../structures");
const { defaultEmbedColor } = require("../config");

const { fetchYoutubeSearchVideos, fetchGitHubSearch, fetchWikipediaSearch, fetchGoogleImageSearch } = require('../utilities/fetchDataFunctions');

module.exports = new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search anything you want on different sites and engine.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('github')
                .setDescription('Search for github repositories.')
                .addStringOption(option =>
                    option
                        .setName('text')
                        .setDescription('The text to search for.')
                        .setRequired(true)
                )
        ).addSubcommand(subcommand =>
            subcommand
                .setName('wikipedia')
                .setDescription('Search for wikipedia articles.')
                .addStringOption(option =>
                    option
                        .setName('text')
                        .setDescription('The text to search for.')
                        .setRequired(true)
                )
        ).addSubcommand(subcommand =>
            subcommand
                .setName('urban-dictionary')
                .setDescription('Search for urban dictionary definitions.')
                .addStringOption(option =>
                    option
                        .setName('text')
                        .setDescription('The text to search for.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('youtube')
                .setDescription('Search for youtube videos.')
                .addStringOption(option =>
                    option
                        .setName('text')
                        .setDescription('The text to search for.')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const message = await interaction.deferReply()
        let subcommand = interaction.options.getSubcommand()
        const text = interaction.options.getString('text');
        if (subcommand === 'youtube') {
            const videos = await fetchYoutubeSearchVideos(text);
            const description = videos.map(({ videoTitle, url }) => `[${videoTitle}](${url})`).join('\n');
            const embed = new EmbedBuilder()
                .setTitle(`Search results for "${text}" on YouTube`)
                .setDescription(description || 'no result found.')
                .setColor(defaultEmbedColor)
            interaction.followUp({
                embeds: [embed]
            });
        } else if (subcommand === 'github') {
            const results = await fetchGitHubSearch(text);
            const embedFields = results.map(({ title, description, url, language, followers }) => ({
                name: title,
                value: `${description}\n- **Language**: ${language}\n- **Followers**: ${followers}\n[Redirect to repository](${url})`
            }));
            const embed = new EmbedBuilder()
                .setTitle(`Search results for "${text}" on GitHub`)
                .setDescription(`**Additonal information**\n- **Main language among the results**: ${results.sort((a, b) => results.filter(v => v === a).length - results.filter(v => v === b).length)[0].language}\n- **Number of results**: ${results.length}.\n\n**Results**`)
                .setColor(defaultEmbedColor)
                .addFields(embedFields);
            interaction.followUp({
                embeds: [embed]
            });
        } else if (subcommand === 'wikipedia') {
            const results = await fetchWikipediaSearch(text);
            const description = results.map(({ title, link }) => `[${title}](${link})`).join('\n');
            const embed = new EmbedBuilder()
                .setTitle(`Search results for "${text}" on Wikipedia`)
                .setColor(defaultEmbedColor)
                .setDescription(description || 'no result found.')
            interaction.followUp({
                embeds: [embed]
            });
        } else if (subcommand === 'urban-dictionary') {
            const results = await fetchUrbanDictionarySearch(text);
            const [firstResult] = results
            const { word, definition, example, author, thumbs_up, thumbs_down, written_on, permalink } = firstResult
            const embed = new EmbedBuilder()
                .setTitle(`Search results for "${text}" on Urban Dictionary`)
                .setURL(permalink)
                .setDescription(`# ${word} (${author})\n- **Definition:**\n\`\`\`${definition}\`\`\`\n- **Example:**\n\`\`\`${example}\`\`\`\n### ${thumbs_up} 👍 ${thumbs_down} 👎`)
                .setColor(defaultEmbedColor)
                .setFooter({ text: `Page 1 / ${results.length} - ${text}` })
                .setTimestamp(new Date(written_on))
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`previous-urban-dictionary-result`)
                        .setEmoji('◀️')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId(`next-urban-dictionary-result`)
                        .setEmoji('▶️')
                        .setStyle('Primary')
                )
            interaction.followUp({
                embeds: [embed],
                components: [actionRow]
            });
        } else {
            interaction.followUp({
                content: 'Invalid subcommand.',
                ephemeral: true
            });
        }
    }
})