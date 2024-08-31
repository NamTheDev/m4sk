const { Colors } = require("discord.js");
const MongoDatabaseCollection = require("./utilities/mongoDatabaseCollection");

module.exports = {
    // Default color for embeds used in bot responses
    "defaultEmbedColor": Colors.DarkRed,

    // Database for storing economy-related data
    "economy": new MongoDatabaseCollection(),

    // List of items available in the shop
    "shopItems": [
        {
            "name": "spins",
            "description": "Allows the user to spin for rewards.",
            "price": 100
        },
        {
            "name": "autofarm bots",
            "description": "Automatically farms credits for the user.",
            "price": 500,
            "usable": true
        }
    ],

    // Available spin amounts for the spin command
    "spinAmounts": [
        "Use x1 spin",
        "Use x5 spin",
        "Use x10 spin",
        "Use x20 spin",
        "Use x50 spin",
        "Use x100 spin"
    ],

    // Cooldown times (in milliseconds) for various commands
    "cooldowns": {
        "balance": 0,        // No cooldown for checking balance
        "work": 900000,      // 15 minutes cooldown for work command
        "spin": 300000,      // 5 minutes cooldown for spin command
        "shop": 0,           // No cooldown for viewing shop
        "inventory": 0,      // No cooldown for checking inventory
        "buy": 0,            // No cooldown for buying items
        "use": 0             // No cooldown for using items
    },

    // Rarity tiers for rewards, including probabilities and prices
    "rarity": [
        { "tier": "C (common)", "baseProbability": 0.4, "price": 10 },
        { "tier": "B (uncommon)", "baseProbability": 0.25, "price": 20 },
        { "tier": "A (rare)", "baseProbability": 0.15, "price": 50 },
        { "tier": "A+ (epic)", "baseProbability": 0.1, "price": 100 },
        { "tier": "S (legendary)", "baseProbability": 0.05, "price": 200 },
        { "tier": "S+ (mythical)", "baseProbability": 0.03, "price": 500 },
        { "tier": "S++ (relic)", "baseProbability": 0.015, "price": 1000 },
        { "tier": "S+++ (ultimate)", "baseProbability": 0.005, "price": 2000 }
    ]
}