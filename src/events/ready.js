const { ActivityType, Routes } = require("discord.js");
const ms = require('ms');
const { client, commands } = require("../..");
const moment = require("moment");
const { rest } = require('../config')

client.on('ready', async () => {
  const activities = [`you.`, `Nam coding.`, `Denji, Aki and Power.`, 'Chainsaw Man.'];
  const botPresence = () => {
    client.user.presence.set({
      activities: [{ name: `${activities[Math.floor(Math.random() * activities.length)]}`, type: ActivityType.Watching }],
    });
    setInterval(botPresence, ms('1 minute'));
  }

  botPresence();

  console.log(`[${moment().format("DD-MM-YYYY HH:mm:ss")}] ${client.user.username} is ready.`);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
    console.log(`Slash commands loaded.\n${commands.map(({ name }) => name).join('\n')}`)
  } catch (error) {
    console.error(error);
  }
})