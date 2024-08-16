require('dotenv').config()

const { Client, GatewayIntentBits, Collection, Routes, InteractionType, EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { readdirSync } = require("fs");
const fetch = require("node-fetch");
const { join } = require("path");
const { defaultEmbedColor } = require('./config');
const { fetchGoogleImageSearch } = require('./utilities/fetchDataFunctions');

const client = new Client({
    intents: Object.keys(GatewayIntentBits).map(intent => intent)
})

const commands = new Collection()
const slashData = []

const commandFiles = readdirSync('commands')
for (const commandFile of commandFiles) {
    const command = require(join(process.cwd(), 'commands', commandFile))
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
const interactionEvent = async (interaction) => {
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
        } else if (interaction.customId === `previous-google-image-result` || interaction.customId === `next-google-image-result`) {
            const [previousButton, nextButton] = interaction.message.components[0].components
            const oldEmbed = interaction.message.embeds[0]
            const page = Number(oldEmbed.footer.text.split('/')[0].split('Page')[1].trim())
            const searchText = oldEmbed.footer.text.split('-')[1].trim()
            const images = await fetchGoogleImageSearch(searchText);
            const pageNumber = interaction.customId.includes('next') ? page + 1 : page - 1
            const image = images[pageNumber - 1]
            const { title, link, imageURL } = image
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setURL(link)
                .setImage(imageURL)
                .setFooter({ text: `Page ${pageNumber} / ${images.length} - ${searchText}` }) // 1 / 10
                .setColor(defaultEmbedColor)
            previousButton.data.disabled = pageNumber === 1
            nextButton.data.disabled = pageNumber === images.length
            await interaction.update({ embeds: [embed], components: interaction.message.components })
        }
    }
}
client.on('interactionCreate', async (interaction) =>
    await interactionEvent(interaction)
        .catch(async error => await interaction.followUp({content: `Oops, there's some trouble with the interactions. Please try again. ${error}`, ephemeral: true})
        )
)

client.login(process.env.TOKEN)