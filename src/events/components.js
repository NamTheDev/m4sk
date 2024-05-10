const { EmbedBuilder } = require("discord.js");
const client = require("../..");
const { prefix } = require("../config");
const addDefaultEmbedSettings = require("../utilFunctions/addDefaultEmbedSettings");

function getCommands(type) {
    const commands = []
    for (const data of type === "prefix" ? client.commands : client.slashCommands) {
        let { name, description, aliases, arguments } = data[1]
        if (!arguments) arguments = []
        if (!aliases) aliases = []
        commands.push({
            name,
            description,
            aliases: aliases.length > 0 ? aliases.map(aliase => `\`${aliase}\``).join(', ') : "No aliases.",
            arguments: arguments.length > 0 ? arguments.map(argument => `\`${argument}\``).join(', ') : "No arguments.",
            usage: `\`\`\`${prefix}${name}${arguments.length > 0 ? arguments.map(argument => ` <${argument}>`).join('') : ''}\`\`\``
        })
    }
    const embeds = commands.map(
        ({ name, description, aliases, arguments, usage }) =>
            addDefaultEmbedSettings(new EmbedBuilder())
                .setTitle(name)
                .setDescription(description)
                .setFields({
                    name: 'Aliases',
                    value: aliases
                }, {
                    name: 'Arguments',
                    value: arguments
                }, {
                    name: 'Usage',
                    value: usage
                })
                .setFooter({
                    text: `Use ${prefix}help to view the help menu`
                })
    )
    return embeds
}

client.on('interactionCreate', (interaction) => {
    if (!interaction.customId) return;
    const [commandName, componentType, channelID, authorID, other] = interaction.customId.split('|')
    if (commandName === "HELP" && interaction.channelId === channelID && interaction.user.id === authorID) {
        if (componentType === "SELECT") {
            if (other === "PREFIX") {
                const index = interaction.values[0] - 1
                const embeds = getCommands('prefix')
                embeds.push(interaction.embeds[0])
                const selectedEmbed = embeds[index]
                interaction.update({ embeds: [selectedEmbed] })
            }
        }
    }
})