const { SlashCommandBuilder, EmbedBuilder, time } = require('discord.js');
const { economy, defaultEmbedColor } = require("../config");
const { SlashCommand } = require("../structures");

const rarity = [
    { tier: 'C (common)', baseProbability: 0.4, price: 10 },
    { tier: 'B (uncommon)', baseProbability: 0.25, price: 20 },
    { tier: 'A (rare)', baseProbability: 0.15, price: 50 },
    { tier: 'A+ (epic)', baseProbability: 0.1, price: 100 },
    { tier: 'S (legendary)', baseProbability: 0.05, price: 200 },
    { tier: 'S+ (mythical)', baseProbability: 0.03, price: 500 },
    { tier: 'S++ (relic)', baseProbability: 0.015, price: 1000 },
    { tier: 'S+++ (ultimate)', baseProbability: 0.005, price: 2000 }
];

function spin(numSpins) {
    let totalProbability = 0;
    let adjustedRarities = rarity.map(r => {
        let adjustmentFactor = 0.25; // Smaller exponent to make higher tiers harder to get
        if (r.tier.includes('S')) {
            adjustmentFactor = 0.0001; // Even smaller exponent for epic and above
        }
        const adjustedProbability = r.baseProbability * Math.pow(numSpins, adjustmentFactor);
        totalProbability += adjustedProbability;
        return {
            tier: r.tier,
            probability: adjustedProbability,
            price: r.price
        };
    });

    adjustedRarities = adjustedRarities.map(r => ({
        tier: r.tier,
        probability: r.probability / totalProbability,
        price: r.price
    }));

    const randomValue = Math.random();
    let cumulativeProbability = 0;
    for (let i = 0; i < adjustedRarities.length; i++) {
        cumulativeProbability += adjustedRarities[i].probability;
        if (randomValue <= cumulativeProbability) {
            const tax = Math.random() * 0.1 + 0.9; // Random tax between 0.9 and 1.0
            return { tier: adjustedRarities[i].tier, price: Math.round(adjustedRarities[i].price * tax) };
        }
    }
}

const shopItems = [
    'Spin x1', 'Spin x5', 'Spin x10', 'Spin x20'
].map(name => {
    const price = Number(name.split('x')[1].trim()) * 100
    return ({ name: `${name} (${price} credits)`, price })
});

const spinAmounts = [
    'Use x1 spin', 'Use x5 spin', 'Use x10 spin', 'Use x20 spin', 'Use x50 spin', 'Use x100 spin'
];

module.exports = new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('economy')
        .setDescription('Manage your economy')
        .addSubcommand(subcommand =>
            subcommand
                .setName('balance')
                .setDescription('Check your wallet and bank balance')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('work')
                .setDescription('Work to earn credits (every 15 minutes)')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('spin')
                .setDescription('Spin and get rare items')
                .addStringOption(option =>
                    option
                        .setName('amount')
                        .setDescription('Specify the amount')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('shop')
                .setDescription('Buy items from the shop')
                .addStringOption(option =>
                    option
                        .setName('item')
                        .setDescription('Item to buy')
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('inventory')
                .setDescription('Check your inventory')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const cooldowns = {
            balance: 0,
            work: 15 * 60 * 1000, // 15 minutes
            spin: 5 * 60 * 1000, // 5 minutes
            shop: 0,
            inventory: 0
        };

        if (!await economy.get(userId)) {
            const rarities = {}
            rarity.forEach(({ tier }) => {
                rarities[tier] = 0
            })
            await economy.set(userId, { wallet: 0, bank: 0, lastWork: 0, spins: 0, rarities });
        }

        const userEconomy = await economy.get(userId);

        if (subcommand === 'balance') {
            const balanceEmbed = new EmbedBuilder()
                .setColor(defaultEmbedColor)
                .setTitle(`${interaction.user.username}'s Balance`)
                .addFields(
                    { name: 'Wallet', value: `${userEconomy.wallet} credits`, inline: true },
                    { name: 'Bank', value: `${userEconomy.bank} credits`, inline: true }
                );

            await interaction.reply({ embeds: [balanceEmbed] });
        }

        if (subcommand === 'work') {
            const currentTime = Date.now();

            if (currentTime - userEconomy.lastWork < cooldowns.work) {
                const timeLeft = Math.floor((userEconomy.lastWork + cooldowns.work) / 1000)
                return await interaction.reply({ content: `You need to wait <t:${timeLeft}:R> before working again.`, ephemeral: true });
            }

            const earnings = Math.floor(Math.random() * 51) + 50; // Random between 50 and 100
            userEconomy.wallet += earnings;
            userEconomy.lastWork = currentTime;
            await economy.set(userId, userEconomy);

            await interaction.reply(`You worked and earned ${earnings} credits!`);
        }

        if (subcommand === 'spin') {
            const spinAmount = interaction.options.getString('amount')
            if (userEconomy.spins < 1) {
                return await interaction.reply({ content: `You don't have enough spins. Buy more from the shop.`, ephemeral: true });
            }
            const result = spin(Number(spinAmount.split(' ')[1].replace('x', '').trim()));
            userEconomy.wallet += result.price;
            userEconomy.spins -= spinAmount;
            userEconomy.rarities[result.tier] += 1

            userEconomy.spins = userEconomy.spins || 0

            await economy.set(userId, userEconomy);
            await interaction.reply(`You received: ${result.tier}, worth ${result.price} credits!`);
        }

        if (subcommand === 'shop') {
            const itemName = interaction.options.getString('item');
            const itemInShop = shopItems.find(item => item.name === itemName)
            if (!itemInShop) {
                return await interaction.reply({ content: `Invalid item.`, ephemeral: true });
            }

            if (userEconomy.wallet < itemInShop.price) {
                return await interaction.reply({ content: `You don't have enough credits to buy this item.`, ephemeral: true });
            }

            userEconomy.wallet -= itemInShop.price;
            userEconomy.spins += parseInt(itemName.split('x')[1].trim());
            await economy.set(userId, userEconomy);

            await interaction.reply(`You bought ${itemName} for ${itemInShop.price} credits.`);
        }

        if (subcommand === 'inventory') {
            const inventoryEmbed = new EmbedBuilder()
                .setColor(defaultEmbedColor)
                .setTitle(`${interaction.user.username}'s Inventory`)
                .addFields(
                    { name: 'Spins', value: `${userEconomy.spins} spins.`, inline: true },
                    { name: 'Rarities', value: `${Object.entries(userEconomy.rarities).map(([name, list]) => `**${name}**: ${list.length}.`).join('\n')}` }
                );

            await interaction.reply({ embeds: [inventoryEmbed] });
        }
    },

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        let choices;
        if (focusedOption.name === 'item') choices = shopItems.map(({ name }) => name);
        if (focusedOption.name === 'amount') choices = spinAmounts;
        const filtered = choices.filter(choice => choice.includes(focusedOption.value));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    }
});
