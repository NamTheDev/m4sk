const { Client, GatewayIntentBits, Collection, Routes } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");

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


client.on('ready', async ({ rest }) => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: slashData },
        );

        console.log('Successfully registered application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})

client.on('interactionCreate', async (interaction) => {
    const command = commands.get(interaction.commandName)
    if (command) await command.execute(interaction)
    if (command.autocomplete) try {
        await command.autocomplete(interaction)
    } catch (e) {
        console.log(e)
    }
})