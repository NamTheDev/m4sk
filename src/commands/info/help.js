const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const ms = require("ms");
const addDefaultEmbedSettings = require("../../utilFunctions/addDefaultEmbedSettings");
const { prefix } = require("../../config");
const SlashCommand = require("../../structures/SlashCommand");

module.exports = new SlashCommand({
    data: {
        name: "help",
        description: "Send a help menu.",
        cooldown: ms('10 seconds'),
        autocomplete: true,
        options: [
            {
                name: 'command',
                
            }
        ]
    },
    ownerOnly: false,
    autoComplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused();
        const commandNames = client.commands.map(({ name }) => name).map(choice => ({ name: choice, value: choice }));
        if (!focusedValue) return await interaction.respond(commandNames)
        const filtered = commandNames.filter(choice => choice.startsWith(focusedValue));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    execute: async (client, interaction) => {
        const commandName = interaction.options.getString()
            let { name, description, aliases, arguments } = client.commands.get()
            if (!arguments) arguments = []
            if (!aliases) aliases = []
                addDefaultEmbedSettings(new EmbedBuilder(), interaction, client)
                    .setTitle(name)
                    .setDescription(description)
                    .setFields({
                        name: 'Aliases',
                        value: aliases.length > 0 ? aliases.map(aliase => `\`${aliase}\``).join(', ') : "No aliases."
                    }, {
                        name: 'Arguments',
                        value: arguments.length > 0 ? arguments.map(argument => `\`${argument}\``).join(', ') : "No options."
                    }, {
                        name: 'Usage',
                        value: `\`\`\`${prefix}${name}${arguments.length > 0 ? arguments.map(argument => ` <${argument}>`).join('') : ''}\`\`\``
                    })
                    .setFooter({
                        text: `Use ${prefix}help to view the help menu`
                    })
        console.log(embeds)
    }
})