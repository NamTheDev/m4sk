const { ActivityType, Events } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const ms = require('ms');
const client = require("../..");

client.on('ready', async () => {
  const rest = new REST({ version: "10" }).setToken(client.token);
  const activities = [`you.`, `Nam coding.`, `Denji, Aki and Power.`, 'Chainsaw Man.'];

  const botPresence = () => {
    client.user.presence.set({
      activities: [{ name: `${activities[Math.floor(Math.random() * activities.length)]}`, type: ActivityType.Watching }],
    });
    setInterval(botPresence, ms('1 minute'));
  }

  botPresence();

  client.log(`${client.user.username} is ready.`);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: client.slashDatas,
    });
  } catch (error) {
    console.error(error);
  }
})