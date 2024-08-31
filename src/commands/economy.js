const { SlashCommandBuilder, EmbedBuilder, time } = require('discord.js');
const { economy, defaultEmbedColor, rarity, spinAmounts, shopItems, cooldowns } = require("../config");
const { SlashCommand } = require("../structures");
const { activateAutofarmBot } = require('../utilities/autofarm');
const { spin } = require('../utilities/spin');

module.exports = new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('economy')
        .setDescription('Manage your economy.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('credits')
                .setDescription('Check your credits.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('work')
                .setDescription('Work to earn credits (every 15 minutes).')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('spin')
                .setDescription('Spin and get rare items.')
                .addStringOption(option =>
                    option
                        .setName('amount')
                        .setDescription('Specify the amount.')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('shop')
                .setDescription('Buy items from the shop.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('inventory')
                .setDescription('Check your inventory.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('buy')
                .setDescription('Buy a specific item.')
                .addStringOption(option =>
                    option
                        .setName('item')
                        .setDescription('Select the item to buy.')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addNumberOption(option =>
                    option
                        .setName('amount')
                        .setDescription('Amount of item to buy.')
                        .setMinValue(1)
                        .setMaxValue(100)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('use')
                .setDescription('Use an item from your inventory.')
                .addStringOption(option =>
                    option
                        .setName('item')
                        .setDescription('Select the item to use.')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('rarity')
                        .setDescription('Apply rarity to a specific item for extra effects.')
                        .setAutocomplete(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        // Initialize user economy if not present
        await initializeUserEconomy(userId);

        const userEconomy = await economy.get(userId);

        switch (subcommand) {
            case 'credits':
                return handleCredits(interaction, userEconomy);

            case 'work':
                return handleWork(interaction, userEconomy, userId);

            case 'spin':
                return handleSpin(interaction, userEconomy);

            case 'shop':
                return handleShop(interaction);

            case 'inventory':
                return handleInventory(interaction, userEconomy);

            case 'buy':
                return handleBuy(interaction, userEconomy);

            case 'use':
                return handleUse(interaction, userEconomy);
        }
    },

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        let choices;

        if (focusedOption.name === 'item') {
            choices = shopItems.map(({ name }) => name);
        } else if (focusedOption.name === 'amount') {
            choices = spinAmounts;
        } else if (focusedOption.name === 'rarity') {
            choices = rarity.map(({ tier }) => tier);
        }

        const filtered = choices.filter(choice => choice.includes(focusedOption.value));
        await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
    }
});

// Function to initialize user economy if not already present
async function initializeUserEconomy(userId) {
    const result = await economy.get(userId)
    if (!result) {
        const initialRarities = rarity.reduce((acc, { tier }) => {
            acc[tier] = 0;
            return acc;
        }, {});
        await economy.set(userId, {
            credits: 0,
            lastWork: 0,
            inventory: {
                spins: 0,
                rarities: initialRarities,
                autofarmBots: 0
            }
        });
    }
}

// Handle the credits subcommand
async function handleCredits(interaction, userEconomy) {
    const balanceEmbed = new EmbedBuilder()
        .setColor(defaultEmbedColor)
        .setTitle(`**${interaction.user.username}**'s credits: \`${userEconomy.credits}\``);

    await interaction.reply({ embeds: [balanceEmbed] });
}

// Handle the work subcommand
async function handleWork(interaction, userEconomy, userId) {
    const currentTime = Date.now();

    if (currentTime - userEconomy.lastWork < cooldowns.work) {
        const timeLeft = Math.floor((userEconomy.lastWork + cooldowns.work) / 1000);
        return await interaction.reply({ content: `You need to wait <t:${timeLeft}:R> before working again.`, ephemeral: true });
    }

    const earnings = Math.floor(Math.random() * 51) + 50; // Random between 50 and 100
    userEconomy.credits += earnings;
    userEconomy.lastWork = currentTime;
    await economy.set(userId, userEconomy);

    await interaction.reply(`You worked and earned ${earnings} credits!`);
}

// Handle the spin subcommand
async function handleSpin(interaction, userEconomy) {
    const spinAmount = interaction.options.getString('amount');
    const numberOfSpins = parseInt(spinAmount.split(' ')[1].replace('x', '').trim());

    if (userEconomy.inventory.spins < 1) {
        return await interaction.reply({ content: `You don't have enough spins. Buy more from the shop.`, ephemeral: true });
    }

    const result = spin(numberOfSpins);
    userEconomy.credits += result.price;
    userEconomy.inventory.spins -= numberOfSpins;
    userEconomy.inventory.rarities[result.tier] += 1;

    await economy.set(interaction.user.id, userEconomy);
    await interaction.reply(`You received: ${result.tier}, worth ${result.price} credits!`);
}

// Handle the shop subcommand
async function handleShop(interaction) {
    const shopEmbed = new EmbedBuilder()
        .setTitle('Shop Items')
        .setDescription('Available items in the shop:')
        .addFields(shopItems.map(({ name, description, price }) => ({
            name,
            value: `> ${description}\n**Cost**: ${price} credits`
        })))
        .setColor(defaultEmbedColor);

    await interaction.reply({ embeds: [shopEmbed] });
}

// Handle the inventory subcommand
async function handleInventory(interaction, userEconomy) {
    const inventoryEmbed = new EmbedBuilder()
        .setColor(defaultEmbedColor)
        .setTitle(`${interaction.user.username}'s Inventory`)
        .addFields(
            { name: 'Spins', value: `${userEconomy.inventory.spins} spin(s).` },
            { name: 'Rarities', value: `${Object.entries(userEconomy.inventory.rarities).map(([name, amount]) => `**${name}**: ${amount}.`).join('\n')}` },
            { name: 'Autofarm bots', value: `${userEconomy.inventory.autofarmBots} bot(s).` }
        );

    await interaction.reply({ embeds: [inventoryEmbed] });
}

// Handle the buy subcommand
async function handleBuy(interaction, userEconomy) {
    const itemName = interaction.options.getString('item').toLowerCase();
    const amount = interaction.options.getNumber('amount') || 1; // Default to 1 if not specified
    const item = shopItems.find(i => i.name.toLowerCase() === itemName);

    // Check if the item exists
    if (!item) {
        return await interaction.reply({ content: `The item '${itemName}' does not exist in the shop.`, ephemeral: true });
    }

    const totalCost = item.price * amount;

    // Check if the user has enough credits
    if (userEconomy.credits < totalCost) {
        return await interaction.reply({ content: `You do not have enough credits to buy ${amount} '${item.name}'. Total cost: ${totalCost} credits.`, ephemeral: true });
    }

    // Deduct the total cost from the user's credits
    userEconomy.credits -= totalCost;

    // Update the inventory based on the purchased item
    if (item.name === 'spins') {
        userEconomy.inventory.spins += amount;
    } else if (item.name === 'autofarm bots') {
        userEconomy.inventory.autofarmBots += amount;
    }

    // Save the updated user economy data
    await economy.set(interaction.user.id, userEconomy);

    // Respond with a success message
    await interaction.reply(`You have successfully bought ${amount} '${item.name}' for ${totalCost} credits.`);
}

// Handle the use subcommand
async function handleUse(interaction, userEconomy) {
    const itemName = interaction.options.getString('item').toLowerCase();
    const selectedRarity = interaction.options.getString('rarity');
    const item = shopItems.find(i => i.name.toLowerCase() === itemName && i.usable);

    const rarityAvailable = Object.keys(userEconomy.inventory.rarities).find(rarity => rarity === selectedRarity);

    if (!item) {
        return await interaction.reply({ content: `You cannot use the item '${itemName}' or it doesn't exist.`, ephemeral: true });
    }

    if (!rarityAvailable) {
        return await interaction.reply({ content: 'You do not own any of this rarity!', ephemeral: true });
    }

    // Implement the usage effect for the item
    if (item.name === 'autofarm bots') {
        if (userEconomy.inventory.autofarmBots < 1) {
            return await interaction.reply({ content: "You don't own this item!", ephemeral: true });
        }

        userEconomy.inventory.autofarmBots -= 1;
        await interaction.reply(await activateAutofarmBot(interaction.user.id, selectedRarity));
    }
}