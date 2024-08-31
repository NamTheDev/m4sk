// Import necessary modules
const { consoleLog } = require('../utilities/consoleLog');
const { Routes } = require('discord.js');

module.exports = {
    // Event name
    name: 'ready',
    // This event should only be triggered once
    once: true,
    // Event execution function
    async execute(client) {
        try {
            // Log the start of the command refresh process
            await consoleLog('Started refreshing application (/) commands.');

            // Register slash commands globally for the application
            await client.rest.put(
                Routes.applicationCommands(client.user.id),
                { body: client.slashData },
            );

            // Log successful registration of commands
            await consoleLog('Successfully registered application (/) commands.');
        } catch (error) {
            // Log any errors that occur during the process
            console.error(error);
        }
    },
};
