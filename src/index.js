require('dotenv').config()
require('../web/index')

const { Client, GatewayIntentBits, Collection, Routes, InteractionType, EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { readdirSync } = require("fs");
const fetch = require("node-fetch");
const { join } = require("path");
const { defaultEmbedColor } = require('./config');
const { fetchUrbanDictionarySearch } = require('./utilities/fetchDataFunctions');

const client = new Client({
    intents: Object.keys(GatewayIntentBits).map(intent => intent)
})

const commands = new Collection()
const slashData = []

const commandFiles = readdirSync('src/commands')
for (const commandFile of commandFiles) {
    const command = require(join(process.cwd(), 'src/commands', commandFile))
    commands.set(command.data.name, command)
    slashData.push(command.data)
}
client.commands = commands
module.exports = client

async function consoleLog(message) {
    await fetch(`https://mask-xpuq.onrender.com/api/consoleLog?key=${process.env.SECRET_KEY}&message=${message}&author=m4sk [${new Date()}]`)
    console.log(message)

}

client.on('ready', async ({ rest }) => {
    try {
        await consoleLog('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: slashData },
        );

        await consoleLog('Successfully registered application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})

const cooldown = new Map()

client.on('interactionCreate', async (interaction) => {
    if (interaction.type === InteractionType.ApplicationCommand) {
        const command = commands.get(interaction.commandName)
        if (command) await command.execute(interaction)
    } else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) try {
        const command = commands.get(interaction.commandName)
        if (command) await command.autocomplete(interaction)
    } catch (e) {
        consoleLog(e)
    } else if (interaction.type === InteractionType.MessageComponent) {
        if (interaction.customId === 'select-command') {
            const command = commands.get(interaction.values[0])
            if (!command && interaction.values[0] === 'all') {
                const embedFields = [];
                commands.forEach(command => {
                    embedFields.push({
                        name: command.data.name,
                        value: `${command.data.description}`,
                        inline: true
                    });
                });
                const embed = new EmbedBuilder()
                    .setTitle('Available Commands')
                    .setColor(defaultEmbedColor)
                    .addFields(embedFields);
                return await interaction.update({
                    embeds: [embed]
                });
            }
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        //title: has command name and index to display the command position. ex: 1/5
                        .setTitle(`${command.data.name}`)
                        .setDescription(`${command.data.description}\n\n**Options:**\`\`\`${command.data.options.map(({ name, type, options }) => {
                            let subcommandOptionsString = '';
                            if (!type) {
                                subcommandOptionsString = ` --> ${options.map(({ name, type }) => `${name} (${ApplicationCommandOptionType[type]})`)}`
                            }
                            return `${name} (${ApplicationCommandOptionType[type] || 'Subcommand'})${subcommandOptionsString}`
                        }).join('\n') || 'no options.'}\`\`\``)
                        .setColor(defaultEmbedColor)
                ]
            })
        } else if (interaction.customId === "previous-urban-dictionary-result" || interaction.customId === "next-urban-dictionary-result") {
            const [previousButton, nextButton] = interaction.message.components[0].components
            const oldEmbed = interaction.message.embeds[0]
            const page = Number(oldEmbed.footer.text.split('/')[0].split('Page')[1].trim())
            const searchText = oldEmbed.footer.text.split('-')[1].trim()
            const results = await fetchUrbanDictionarySearch(searchText);
            const pageNumber = interaction.customId.includes('next') ? page + 1 : page - 1
            const result = results[pageNumber - 1]
            const { word, definition, example, author, thumbs_up, thumbs_down, written_on, permalink } = result
            const embed = new EmbedBuilder()
                .setTitle(`Search results for "${searchText}" on Urban Dictionary`)
                .setURL(permalink)
                .setDescription(`# ${word} (${author})\n- **Definition:**\n\`\`\`${definition}\`\`\`\n- **Example:**\n\`\`\`${example}\`\`\`\n### ${thumbs_up} 👍 ${thumbs_down} 👎`)
                .setColor(defaultEmbedColor)
                .setFooter({ text: `Page ${pageNumber} / ${results.length} - ${searchText}` })
                .setTimestamp(new Date(written_on))
            previousButton.data.disabled = pageNumber === 1
            nextButton.data.disabled = pageNumber === results.length
            await interaction.update({ embeds: [embed], components: interaction.message.components })
        }
    }
})

client.login(process.env.TOKEN)