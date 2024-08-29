const fetch = require("node-fetch"); // Import fetch for making HTTP requests
const urbanDictionary = require('@dmzoneill/urban-dictionary'); // Import the Urban Dictionary module for fetching definitions
const { htmlToMarkdown } = require("./stringFunctions"); // Import a helper function for converting HTML to Markdown

/**
 * Fetch YouTube search results based on a given query text.
 * @param {string} text - The search query.
 * @returns {Promise<Array<{videoTitle: string, url: string}>>} - A list of YouTube video titles and URLs.
 */
async function fetchYoutubeSearchVideos(text) {
    // Fetch the HTML content of YouTube search results page
    const response = await fetch(`https://www.youtube.com/results?search_query=${text}`);
    const html = await response.text();

    // Split the HTML to extract video details and map the results
    const videos = html
        .split('{"videoRenderer":{"videoId":"') // Split to locate video data
        .slice(1) // Skip the first element as it's not a video
        .map(video => {
            // Extract the video title
            const videoTitle = video.split('"title":{"runs":[{"text":"')[1]
                .split('"}],"accessibility":{"accessibilityData":{"label":"')[0];
            
            // Extract the video ID
            const videoId = video.split('"')[0];

            // Construct the video URL
            const url = `https://www.youtube.com/watch?v=${videoId}`;
            
            // Return the extracted data as an object
            return { videoTitle, url };
        });

    return videos; // Return the list of videos
}

/**
 * Fetch GitHub repositories based on a search query.
 * @param {string} text - The search query for GitHub repositories.
 * @returns {Promise<Array<{title: string, description: string, url: string, language: string, followers: string, updated_date: string}>>} - A list of formatted repository details.
 */
async function fetchGitHubSearch(text) {
    // Fetch search results from GitHub
    const response = await fetch(`https://github.com/search?q=${text}&type=repositories`);
    const data = await response.json();

    // Extract and format repository information from the response
    const results = data.payload.results.map(repo => {
        // Extract relevant fields with fallback defaults
        const {
            archived = false, // Whether the repo is archived
            hl_name = 'Untitled', // Highlighted repo name
            hl_trunc_description = 'no description.', // Highlighted truncated description
            language = 'no language', // Programming language used
            followers = 'no followers', // Number of followers
            repo: {
                repository: {
                    updated_at = new Date().toISOString(), // Last update date
                    name = 'unknown', // Repository name
                    owner_login = 'unknown' // Repository owner's login
                } = {}
            } = {}
        } = repo;

        // Format title, description, and URL
        const title = htmlToMarkdown(`${hl_name.replace(/<\/?em>/g, '')}${archived ? ' [ARCHIVED]' : ''}`.replace('/', ' (author) / '));
        const description = htmlToMarkdown(decodeURIComponent(hl_trunc_description.replace(/<\/?em>/g, '')));
        const url = `https://github.com/${owner_login}/${name}`;

        // Format updated date to a relative timestamp for display
        const updatedDate = `<t:${Math.floor(new Date(updated_at).getTime() / 1000)}:R>`;

        // Return formatted repository details
        return {
            title,
            description,
            url,
            language,
            followers,
            updated_date: updatedDate,
        };
    });

    return results; // Return the list of repositories
}

/**
 * Fetch Wikipedia search results based on a query.
 * @param {string} text - The search query.
 * @returns {Promise<Array<{title: string, link: string}>>} - A list of Wikipedia titles and links.
 */
async function fetchWikipediaSearch(text) {
    // Fetch search results from Wikipedia API
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${text}&namespace=0&format=json`);
    const data = await response.json();

    // Extract titles and links, then map to structured objects
    const titles = data[1]; // List of titles
    const links = data[3];  // Corresponding URLs

    // Combine titles and links into a structured result
    const results = titles.map((title, index) => ({
        title,
        link: links[index]
    }));

    return results; // Return the list of search results
}

/**
 * Fetch definitions from Urban Dictionary based on a search term.
 * @param {string} text - The term to search for.
 * @returns {Promise<Array>} - The list of definitions from Urban Dictionary.
 */
async function fetchUrbanDictionarySearch(text) {
    // Fetch definitions for the term from Urban Dictionary
    const results = await urbanDictionary.define(text);
    return results; // Return the list of definitions
}

// Export all functions for use in other modules
module.exports = { 
    fetchYoutubeSearchVideos, 
    fetchGitHubSearch, 
    fetchWikipediaSearch, 
    fetchUrbanDictionarySearch 
};
