// Import required modules and configurations
const { SlashCommandBuilder, EmbedBuilder, time } = require('discord.js');
const { economy, defaultEmbedColor, rarity, spinAmounts, shopItems, cooldowns } = require("../config");
const { SlashCommand } = require("../structures");
const { activateAutofarmBot } = require('../utilities/autofarm');
const { spin } = require('../utilities/spin');

// Define subcommand handlers for each economy action
const subcommandHandlers = {
    credits: handleCredits,
    work: handleWork,
    spin: handleSpin,
    shop: handleShop,
    inventory: handleInventory,
    buy: handleBuy,
    use: handleUse
};

// Define autocomplete handlers for various options
const autocompleteHandlers = {
    item: () => shopItems.map(({ name }) => name),
    amount: () => spinAmounts,
    rarity: () => rarity.map(({ tier }) => tier)
};

// Export the SlashCommand for the economy system
module.exports = new SlashCommand({
    // Define the command structure using SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName('economy')
        .setDescription('Manage your economy.')
        // Add subcommands for various economy actions
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

    // Main execute function for the economy command
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        // Initialize user economy if not present
        await initializeUserEconomy(userId);

        const userEconomy = await economy.get(userId);

        // Execute the appropriate subcommand handler
        return subcommandHandlers[subcommand](interaction, userEconomy, userId);
    },

    // Autocomplete function for various options
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const choices = autocompleteHandlers[focusedOption.name]();

        const filtered = choices.filter(choice => choice.includes(focusedOption.value));
        await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
    }
});

// Function to initialize user economy if not already present
async function initializeUserEconomy(userId) {
    const result = await economy.get(userId);
    result || await economy.set(userId, {
        credits: 0,
        lastWork: 0,
        inventory: {
            spins: 0,
            rarities: rarity.reduce((acc, { tier }) => ({ ...acc, [tier]: 0 }), {}),
            autofarmBots: 0
        }
    });
}

// Handle the credits subcommand
async function handleCredits(interaction, userEconomy) {
    // Create an embed to display user's credits
    const balanceEmbed = new EmbedBuilder()
        .setColor(defaultEmbedColor)
        .setTitle(`**${interaction.user.username}**'s credits: \`${userEconomy.credits}\``);

    await interaction.reply({ embeds: [balanceEmbed] });
}

// Handle the work subcommand
async function handleWork(interaction, userEconomy, userId) {
    const currentTime = Date.now();
    const cooldownPassed = currentTime - userEconomy.lastWork >= cooldowns.work;

    return cooldownPassed
        ? handleSuccessfulWork(interaction, userEconomy, userId, currentTime)
        : handleCooldownResponse(interaction, userEconomy);
}

// Handle successful work attempt
async function handleSuccessfulWork(interaction, userEconomy, userId, currentTime) {
    const earnings = Math.floor(Math.random() * 51) + 50; // Random earnings between 50 and 100
    userEconomy.credits += earnings;
    userEconomy.lastWork = currentTime;
    await economy.set(userId, userEconomy);
    return interaction.reply(`You worked and earned ${earnings} credits!`);
}

// Handle work attempt during cooldown
async function handleCooldownResponse(interaction, userEconomy) {
    const timeLeft = Math.floor((userEconomy.lastWork + cooldowns.work) / 1000);
    return interaction.reply({ content: `You need to wait <t:${timeLeft}:R> before working again.`, ephemeral: true });
}

// Handle the spin subcommand
async function handleSpin(interaction, userEconomy) {
    const spinAmount = interaction.options.getString('amount');
    const numberOfSpins = parseInt(spinAmount.split(' ')[1].replace('x', '').trim());

    return userEconomy.inventory.spins < 1
        ? interaction.reply({ content: `You don't have enough spins. Buy more from the shop.`, ephemeral: true })
        : performSpin(interaction, userEconomy, numberOfSpins);
}

// Perform the spin action
async function performSpin(interaction, userEconomy, numberOfSpins) {
    const result = spin(numberOfSpins);
    userEconomy.credits += result.price;
    userEconomy.inventory.spins -= numberOfSpins;
    userEconomy.inventory.rarities[result.tier] += 1;

    await economy.set(interaction.user.id, userEconomy);
    return interaction.reply(`You received: ${result.tier}, worth ${result.price} credits!`);
}

// Handle the shop subcommand
async function handleShop(interaction) {
    // Create an embed to display shop items
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
    // Create an embed to display user's inventory
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
    const amount = interaction.options.getNumber('amount') || 1;
    const item = shopItems.find(i => i.name.toLowerCase() === itemName);

    return !item
        ? interaction.reply({ content: `The item '${itemName}' does not exist in the shop.`, ephemeral: true })
        : processPurchase(interaction, userEconomy, item, amount);
}

// Process the purchase of an item
async function processPurchase(interaction, userEconomy, item, amount) {
    const totalCost = item.price * amount;
    return userEconomy.credits < totalCost
        ? interaction.reply({ content: `You do not have enough credits to buy ${amount} '${item.name}'. Total cost: ${totalCost} credits.`, ephemeral: true })
        : completePurchase(interaction, userEconomy, item, amount, totalCost);
}

// Complete the purchase transaction
async function completePurchase(interaction, userEconomy, item, amount, totalCost) {
    userEconomy.credits -= totalCost;
    userEconomy.inventory[item.name === 'spins' ? 'spins' : 'autofarmBots'] += amount;
    await economy.set(interaction.user.id, userEconomy);
    return interaction.reply(`You have successfully bought ${amount} '${item.name}' for ${totalCost} credits.`);
}

// Handle the use subcommand
async function handleUse(interaction, userEconomy) {
    const itemName = interaction.options.getString('item').toLowerCase();
    const selectedRarity = interaction.options.getString('rarity');
    const item = shopItems.find(i => i.name.toLowerCase() === itemName && i.usable);
    const rarityAvailable = Object.keys(userEconomy.inventory.rarities).find(rarity => rarity === selectedRarity);

    return !item
        ? interaction.reply({ content: `You cannot use the item '${itemName}' or it doesn't exist.`, ephemeral: true })
        : !rarityAvailable
            ? interaction.reply({ content: 'You do not own any of this rarity!', ephemeral: true })
            : useItem(interaction, userEconomy, item, selectedRarity);
}

// Use a specific item
async function useItem(interaction, userEconomy, item, selectedRarity) {
    return item.name === 'autofarm bots'
        ? userEconomy.inventory.autofarmBots < 1
            ? interaction.reply({ content: "You don't own this item!", ephemeral: true })
            : useAutofarmBot(interaction, userEconomy, selectedRarity)
        : interaction.reply({ content: "This item cannot be used.", ephemeral: true });
}

// Use an autofarm bot
async function useAutofarmBot(interaction, userEconomy, selectedRarity) {
    userEconomy.inventory.autofarmBots -= 1;
    const result = await activateAutofarmBot(interaction.user.id, selectedRarity);
    return interaction.reply(result);
}