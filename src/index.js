require('dotenv').config(); // Load environment variables from .env file

// Import required Discord.js classes and modules
const {
    Client,
    GatewayIntentBits,
    Collection,
    Routes,
    InteractionType,
    EmbedBuilder,
    ApplicationCommandOptionType,
} = require("discord.js");

const { readdirSync } = require("fs"); // For reading command files
const fetch = require("node-fetch"); // For making HTTP requests
const { join } = require("path"); // For handling file paths
const { defaultEmbedColor, economy } = require('./config'); // Import configuration values
const { fetchUrbanDictionarySearch } = require('./utilities/fetchDataFunctions'); // Import utility functions
const { claimAutofarmCredits } = require('./utilities/autofarm'); // Autofarm credit claiming utility

// Initialize the Discord client with intents using all available GatewayIntentBits
const client = new Client({
    intents: Object.keys(GatewayIntentBits).map(intent => intent)
});

// Initialize command collections and data for slash commands
client.commands = new Collection();
client.slashData = [];

// Load and register command files
const commandFiles = readdirSync('src/commands');
for (const commandFile of commandFiles) {
    const command = require(join(process.cwd(), 'src/commands', commandFile));
    client.commands.set(command.data.name, command);
    client.slashData.push(command.data);
}

// Load event files
const eventFiles = readdirSync('src/events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Log in to Discord using the bot token from the environment variables
client.login(process.env.TOKEN);

module.exports = client;