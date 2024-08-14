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
        const videoId = video.split('"')[0];
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        return url
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
        const embeds = []
        const messages = []
        switch (type) {
            case 'youtube':
                JSONdataArray = await fetchYoutubeSearchVideos(query);
                JSONdataArray.forEach((url) => {
                    messages.push(url)
                })
                break;
            case 'wikipedia':
                JSONdataArray = await fetchWikipediaSearch(query);
                JSONdataArray.forEach(({ title, link }) => {
                    embeds.push(new EmbedBuilder()
                        .setTitle(title)
                        .setURL(link)
                        .setColor(defaultEmbedColor)
                    )
                })
                break;
            case 'github': {
                JSONdataArray = await fetchGitHubSearch(query);
                JSONdataArray.forEach(({ title, description, url, language, followers, color }) => {
                    embeds.push(new EmbedBuilder()
                        .setTitle(title)
                        .setURL(url)
                        .setDescription(description)
                        .addField('Language', language, true)
                        .addField('Followers', followers, true) // TODO: add a link to followers
                        .setColor(color)
                    )
                })
                break;
            }
            case 'urban':
                JSONdataArray = await fetchUrbanDictionarySearch(query);
                JSONdataArray.forEach(({ word, definition, example, permalink, thumbs_up, thumbs_down }) => {
                    embeds.push(new EmbedBuilder()
                        .setTitle(word)
                        .setURL(permalink)
                        .setDescription(definition)
                        .addField('Example', example, true)
                        .addField('Thumbs Up', thumbs_up, true)
                        .addField('Thumbs Down', thumbs_down, true)
                        .setColor(defaultEmbedColor)
                    )
                })
                break;
        }
        // Button to switch page
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous-page')
                    .setEmoji('⬅️')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('next-page')
                    .setEmoji('➡️')
                    .setStyle('Primary')
            )
            const options = {
                components: [actionRow],
                ephemeral: true
            }
            embeds.length > 0 ? options.embeds = [embeds[0]] : options.content = messages[0]
        interaction.reply(options);
    }
});