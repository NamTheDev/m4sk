const { Routes } = require("discord.js")
const { rest } = require("../../src")

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res
 */
module.exports = async (req, res) => {
    const user = await rest.get(Routes.user(req.query.userID))
    res.json({ response: user.username !== "M4sk" })
}