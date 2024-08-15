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

async function fetchGoogleImageSearch(text) {
    const response = await fetch(`https://serpapi.com/search.json?q=${text}&engine=google_images&ijn=0`);
    const data = await response.json()
    return data['images_results'].map(({ original, title, link, source }) => ({ imageURL: original, title: `${title} (source: ${source})`, link, source }));
}

module.exports = { fetchYoutubeSearchVideos, fetchGitHubSearch, fetchWikipediaSearch, fetchUrbanDictionarySearch, fetchGoogleImageSearch };