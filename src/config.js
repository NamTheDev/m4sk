const { Colors } = require("discord.js");
const { textDatabase } = require("multi-purpose");

module.exports = {
    "defaultEmbedColor": Colors.DarkRed,
    "economy": new textDatabase('economy'),
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
    "spinAmounts": [
        "Use x1 spin",
        "Use x5 spin",
        "Use x10 spin",
        "Use x20 spin",
        "Use x50 spin",
        "Use x100 spin"
    ],
    "cooldowns": {
        "balance": 0,
        "work": 900000,
        "spin": 300000,
        "shop": 0,
        "inventory": 0,
        "buy": 0,
        "use": 0
    },
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