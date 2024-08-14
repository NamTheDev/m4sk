const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } = require("discord.js");
const urbanDictionary = require('@dmzoneill/urban-dictionary');
const { SlashCommand } = require("../structures");
const { defaultEmbedColor } = require("../config");
const { readdirSync } = require("fs");

const fetch = require("node-fetch");
async function fetchYoutubeSearchVideos(text) {
    const response = await fetch(`https://www.youtube.com/results?search_query=${text}`);
    const html = await response.text();
    const videos = html.split('{"videoRenderer":{"videoId":"').slice(1).map(video => {
        const videoTitle = video.split(('"title":{"runs":[{"text":"'))[1].split('"}],"accessibility":{"accessibilityData":{"label":"')[0];
        const videoId = video.split('"')[0];
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        return { videoTitle, url }
    });
    return videos;
}

async function fetchGitHubSearch(text) {
    const response = await fetch(`https://github.com/search?q=${text}`);
    const data = await response.json();
    const results = data.payload.results.map(({ hl_name, hl_trunc_description, language, followers }) => {
        const repositoryTitle = hl_name.replace(/<em>|<\/em>/g, "")
        const title = repositoryTitle.replace('/', ' (author) / ');
        const repositoryDescription = hl_trunc_description
        const linkToRepository = repositoryTitle
        const description = decodeURI(repositoryDescription ? repositoryDescription.replace(/<em>|<\/em>/g, "") : 'no description.')
        const url = `https://github.com/${linkToRepository}`;
        language = language ? language : 'no language.';
        followers = followers ? followers : 'no followers.';
        return { title, description, url, language, followers };
    });
    return results
}

async function fetchWikipediaSearch(text) {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${text}&namespace=0&format=json`);
    const data = await response.json();
    const titles = data[1]
    const links = data[3]
    const results = titles.map((title, index) => ({
        title,
        link: links[index]
    }));
    return results;
}

async function fetchUrbanDictionarySearch(text) {
    const results = await urbanDictionary.define(text);
    return results;
}


module.exports = new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search anything you want on different sites and engine.')
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
        ).addSubcommand(subcommand =>
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
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const text = interaction.options.getString('text');
        if (subcommand === 'youtube') {
            const videos = await fetchYoutubeSearchVideos(text);
            const description = videos.map(({ videoTitle, url }) => `[${videoTitle}](${url})`).join('\n');
            const embed = new EmbedBuilder()
                .setTitle(`Search results for "${text}" on YouTube`)
                .setDescription(description)
                .setColor(defaultEmbedColor)
            interaction.reply({
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
            interaction.reply({
                embeds: [embed]
            });
        } else if (subcommand === 'wikipedia') {
            const results = await fetchWikipediaSearch(text);
            const description = results.map(({ title, link }) => `[${title}](${link})`).join('\n');
            const embed = new EmbedBuilder()
                .setTitle(`Search results for "${text}" on Wikipedia`)
                .setColor(defaultEmbedColor)
                .setDescription(description)
            interaction.reply({
                embeds: [embed]
            });
        } else if (subcommand === 'urban-dictionary') {
            const results = await fetchUrbanDictionarySearch(text);
            const embedArray = results.map(({ word, definition, example, author, thumbs_up, thumbs_down, written_on, permalink }, index) =>
                new EmbedBuilder()
                    .setTitle(`Search results for "${text}" on Urban Dictionary (${index + 1}/${results.length})`)
                    .setURL(permalink)
                    .setDescription(`# ${word} (${author})\n- **Definition:**\n\`\`\`${definition}\`\`\`\n- **Example:**\n\`\`\`${example}\`\`\`\n### ${thumbs_up} 👍 ${thumbs_down} 👎`)
                    .setColor(defaultEmbedColor)
                    .setTimestamp(new Date(written_on))
            )
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous-urban-dictionary-result')
                        .setEmoji('◀️')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('next-urban-dictionary-result')
                        .setEmoji('▶️')
                        .setStyle('Primary')
                )
            interaction.reply({
                embeds: [embedArray[0]],
                components: [actionRow]
            });
        } else {
            interaction.reply({
                content: 'Invalid subcommand.',
                ephemeral: true
            });
        }
    }
})