const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const urbanDictionary = require('@dmzoneill/urban-dictionary');
const { SlashCommand } = require("../structures");
const { defaultEmbedColor } = require("../config");
const { readdirSync } = require("fs");

const fetch = require("node-fetch");
async function fetchYoutubeSearchVideos(text) {
    const response = await fetch(`https://www.youtube.com/results?search_query=${text}`);
    const html = await response.text();
    //convert to array data
    const videos = html.split('{"videoRenderer":{"videoId":"').slice(1).map(video => {
        const videoId = video.split('"')[0];
        const title = video.split('"title":{"runs":[{"text":"')[1].split('"}')[0];
        const thumbnail = video.split('"thumbnails":[{"url":"')[1].split('"')[0];
        return { videoId, title, thumbnail };
    });
    return videos;
}

async function fetchGitHubSearch(text) {
    const response = await fetch(`https://github.com/search?q=${text}`);
    const data = await response.json();
    const results = data.payload.results.map(({ hl_name, hl_trunc_description, language, followers, color }) => {
        const repositoryTitle = hl_name.replace(/<em>|<\/em>/g, "")
        const title = repositoryTitle.replace('/', ' (author) / ');
        const repositoryDescription = hl_trunc_description
        const linkToRepository = repositoryTitle
        const description = decodeURI(repositoryDescription ? repositoryDescription.replace(/<em>|<\/em>/g, "") : 'no description.')
        const url = `https://github.com/${linkToRepository}`;
        language = language ? language : 'no language.';
        followers = followers ? followers : 'no followers.';
        return { title, description, url, language, followers, color };
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
        .addStringOption(option => option.setName('query').setDescription('The query to search for.').setRequired(true))
        .addStringOption(option => option.setName('type').setDescription('The type of search.').setRequired(true)
            .addChoices(
                { name: 'YouTube', value: 'youtube' },
                { name: 'Wikipedia', value: 'wikipedia' },
                { name: 'GitHub', value: 'github' },
                { name: 'Urban Dictionary', value: 'urban' }
            )
        ),
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const type = interaction.options.getString('type');
        let JSONdataArray = []
        let embed = new EmbedBuilder()
            .setTitle(`Search results for "${query}" on ${type}`)
            .setColor(defaultEmbedColor);
        const embedFields = []
        switch (type) {
            case 'youtube':
                fetchYoutubeSearchVideos(query).then(videos => {
                    videos.forEach(video => {
                        embedFields.push({
                            name: video.title,
                            value: `[Watch on YouTube](https://www.youtube.com/watch?v=${video.videoId})`,
                            inline: true
                        });
                    });
                    embed.addFields(embedFields);
                    interaction.reply({
                        embeds: [embed],
                        ephemeral: true
                    });
                });
                break;
            case 'wikipedia':
                fetchWikipediaSearch(query).then(results => {
                    results.forEach(result => {
                        embedFields.push({
                            name: result.title,
                            value: `[Read on Wikipedia](${result.link})`,
                            inline: true
                        });
                    });
                    embed.addFields(embedFields);
                    interaction.reply({
                        embeds: [embed],
                        ephemeral: true
                    });
                });
                break;
            case 'github':
                fetchGitHubSearch(query).then(results => {
                    results.forEach(result => {
                        embedFields.push({
                            name: result.title,
                            value: `[View on GitHub](${result.url})`,
                            inline: true
                        });
                    });
                    embed.addFields(embedFields);
                    interaction.reply({
                        embeds: [embed],
                        ephemeral: true
                    });
                });
                break;
            case 'urban':
                fetchUrbanDictionarySearch(query).then(results => {
                    results.forEach(result => {
                        embedFields.push({
                            name: result.word,
                            value: result.definition, // The definition of the word
                            inline: true
                        });
                    });
                    embed.addFields(embedFields);
                    interaction.reply({
                        embeds: [embed],
                        ephemeral: true
                    });
                });
                break;
        }
        await interaction.reply( {
            embeds: [embed],
            ephemeral: true
        });
    }
});