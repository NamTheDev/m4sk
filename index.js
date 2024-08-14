require('dotenv').config()

const { Client, GatewayIntentBits, Collection, Routes, InteractionType, EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { readdirSync } = require("fs");
const fetch = require("node-fetch");
const { join } = require("path");
const { defaultEmbedColor } = require('./config');

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
            const { message } = interaction
            message.edit({
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
            await interaction.deferUpdate()
        }
    }
})

client.login(process.env.TOKEN)