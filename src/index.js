require('dotenv').config(); // Load environment variables from .env file
require('../web/index'); // Import any web-related dependencies or initializations

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
const commands = new Collection();
const slashData = [];

// Load and register command files
const commandFiles = readdirSync('src/commands');
for (const commandFile of commandFiles) {
    const command = require(join(process.cwd(), 'src/commands', commandFile));
    commands.set(command.data.name, command); // Register each command
    slashData.push(command.data); // Add command data for registration
}

client.commands = commands; // Attach commands to the client
module.exports = client; // Export the client for external use

/**
 * Log messages to the console and an external API for debugging.
 * @param {string} message - The message to log.
 */
async function consoleLog(message) {
    // Send the log message to an external service
    await fetch(`https://mask-xpuq.onrender.com/api/consoleLog?key=${process.env.SECRET_KEY}&message=${message}&author=m4sk [${new Date()}]`);
    console.log(message); // Log the message to the console
}

// Event: When the bot is ready and logged in
client.on('ready', async ({ rest }) => {
    try {
        // Log the start of command registration
        await consoleLog('Started refreshing application (/) commands.');

        // Register slash commands globally
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: slashData },
        );

        // Log successful registration
        await consoleLog('Successfully registered application (/) commands.');
    } catch (error) {
        console.error(error); // Log any errors during the registration process
    }
});

/**
 * Handle interactions (commands, autocompletes, message components).
 */
client.on('interactionCreate', async (interaction) => {
    switch (interaction.type) {
        case InteractionType.ApplicationCommand:
            // Handle command execution
            await handleCommandExecution(interaction);
            break;
        case InteractionType.ApplicationCommandAutocomplete:
            // Handle autocomplete interaction
            await handleAutocomplete(interaction);
            break;
        case InteractionType.MessageComponent:
            // Handle message component interactions (like buttons or select menus)
            await handleComponentInteraction(interaction);
            break;
    }
});

/**
 * Handle the execution of commands.
 * @param {Object} interaction - The interaction object.
 */
async function handleCommandExecution(interaction) {
    const command = commands.get(interaction.commandName);
    if (command) await command.execute(interaction);
}

/**
 * Handle autocomplete interactions.
 * @param {Object} interaction - The interaction object.
 */
async function handleAutocomplete(interaction) {
    try {
        const command = commands.get(interaction.commandName);
        if (command) await command.autocomplete(interaction);
    } catch (error) {
        await consoleLog(error);
    }
}

/**
 * Handle message component interactions like buttons or select menus.
 * @param {Object} interaction - The interaction object.
 */
async function handleComponentInteraction(interaction) {
    if (interaction.customId === 'select-command') {
        await handleSelectCommand(interaction);
    } else if (interaction.customId === "previous-urban-dictionary-result" || interaction.customId === "next-urban-dictionary-result") {
        await handleUrbanDictionaryPagination(interaction);
    }
}

/**
 * Handle the selection of commands from a select menu.
 * @param {Object} interaction - The interaction object.
 */
async function handleSelectCommand(interaction) {
    const selectedCommand = commands.get(interaction.values[0]);

    if (!selectedCommand && interaction.values[0] === 'all') {
        const embedFields = commands.map(command => ({
            name: command.data.name,
            value: command.data.description,
            inline: true,
        }));

        const embed = new EmbedBuilder()
            .setTitle('Available Commands')
            .setColor(defaultEmbedColor)
            .addFields(embedFields);

        return await interaction.update({
            embeds: [embed],
        });
    }

    // Construct the command embed with options if available
    const commandOptions = selectedCommand.data.options.map(({ name, type, options }) => {
        const subcommandOptions = options?.map(({ name, type }) => `${name} (${ApplicationCommandOptionType[type]})`).join(' & ') || '❌';
        return `${name} (${ApplicationCommandOptionType[type] || 'Subcommand'}) --> ${subcommandOptions}`;
    }).join('\n') || 'No options.';

    const embed = new EmbedBuilder()
        .setTitle(selectedCommand.data.name)
        .setDescription(`${selectedCommand.data.description}\n\n**Options:**\`\`\`${commandOptions}\`\`\``)
        .setColor(defaultEmbedColor);

    await interaction.update({
        embeds: [embed],
    });
}

/**
 * Handle pagination of Urban Dictionary results with previous/next buttons.
 * @param {Object} interaction - The interaction object.
 */
async function handleUrbanDictionaryPagination(interaction) {
    // Extract current page and search text from the embed footer
    const [previousButton, nextButton] = interaction.message.components[0].components;
    const oldEmbed = interaction.message.embeds[0];
    const page = Number(oldEmbed.footer.text.split('/')[0].split('Page')[1].trim());
    const searchText = oldEmbed.footer.text.split('-')[1].trim();

    // Fetch the Urban Dictionary results for the given search text
    const results = await fetchUrbanDictionarySearch(searchText);
    const pageNumber = interaction.customId.includes('next') ? page + 1 : page - 1;
    const result = results[pageNumber - 1];

    // Destructure relevant details from the Urban Dictionary result
    const { word, definition, example, author, thumbs_up, thumbs_down, written_on, permalink } = result;

    // Create a new embed with updated page details
    const embed = new EmbedBuilder()
        .setTitle(`Search results for "${searchText}" on Urban Dictionary`)
        .setURL(permalink)
        .setDescription(`# ${word} (${author})\n- **Definition:**\n\`\`\`${definition}\`\`\`\n- **Example:**\n\`\`\`${example}\`\`\`\n### ${thumbs_up} 👍 ${thumbs_down} 👎`)
        .setColor(defaultEmbedColor)
        .setFooter({ text: `Page ${pageNumber} / ${results.length} - ${searchText}` })
        .setTimestamp(new Date(written_on));

    // Update the button states based on the current page
    previousButton.data.disabled = pageNumber === 1;
    nextButton.data.disabled = pageNumber === results.length;

    // Update the interaction with the new embed and button states
    await interaction.update({ embeds: [embed], components: interaction.message.components });
}

// Event: When a new message is created
client.on('messageCreate', async (message) => {
    // Attempt to claim autofarm credits for the message author
    const messageContent = await claimAutofarmCredits(message.author.id);
    if (messageContent) message.reply(messageContent);
});

// Log in to Discord using the bot token from the environment variables
client.login(process.env.TOKEN);