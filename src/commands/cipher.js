const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { encode, decode } = require('../utilities/codes');
const { availableTypes, defaultEmbedColor } = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cipher')
        .setDescription('Encode or decode a message using various methods')
        .addSubcommand(subcommand =>
            subcommand
                .setName('encode')
                .setDescription('Encode a message')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('The encoding type to use')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('The message to encode')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('decode')
                .setDescription('Automatically decode a message')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('The message to decode')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List available encoding/decoding types')
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'list') {
            const typeList = availableTypes.map(type => `- ${type}`).join('\n');
            await interaction.reply(`Available encoding/decoding types:\n${typeList}`);
            return;
        }

        let message = interaction.options.getString('message');
        // Check if the message is a valid Discord message ID
        if (/^\d{17,19}$/.test(message)) {
            try {
                // Attempt to fetch the message using the ID
                const fetchedMessage = await interaction.channel.messages.fetch(message);
                if (fetchedMessage) {
                    // If successful, use the content of the fetched message
                    message = fetchedMessage.embeds[0].description.split('```')[1];
                    console.log(message);
                }
            } catch (error) {
                // If fetching fails, continue with the original message
                console.error('Error fetching message:', error);
            }
        }

        try {
            let result;
            let embed;
            if (subcommand === 'encode') {
                const type = interaction.options.getString('type');
                result = encode(message, type);
                embed = new EmbedBuilder()
                    .setColor(defaultEmbedColor)
                    .setTitle('Encoded message')
                    .setDescription(`\`\`\`${result}\`\`\``);
                await interaction.reply({ embeds: [embed] });
            } else if (subcommand === 'decode') {
                let decodedResults = [];
                for (const type of availableTypes) {
                    try {
                        const decodedMessage = decode(message, type.toLowerCase());
                        decodedResults.push({ type, message: decodedMessage });
                    } catch (error) {
                        console.error(`Error decoding with ${type}:`, error);
                    }
                }
                const isValidResult = (result, originalMessage) => 
                    result.message.trim().match(/^[a-zA-Z0-9]+$/) && 
                    result.message.toLowerCase() !== originalMessage.toLowerCase();

                const createField = (result) => ({
                    name: result.type,
                    value: `\`\`\`${result.message}\`\`\``,
                    inline: true
                });

                const fields = decodedResults
                    .filter(result => isValidResult(result, message))
                    .map(createField)

                const embed = new EmbedBuilder()
                    .setColor(defaultEmbedColor)
                    .setTitle('Decoded Results')
                    
                    fields.length > 0 ? embed.addFields(fields) : embed.setDescription('Unable to automatically decode the message. The format might be unsupported or the message might not be encoded.');

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            await interaction.reply(`Error: ${error.message}`);
        }
    },
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const choices = availableTypes.filter(type => type.toLowerCase().startsWith(focusedValue.toLowerCase()));
        await interaction.respond(choices.map(choice => ({ name: choice, value: choice })));
    },
};