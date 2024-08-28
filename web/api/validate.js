module.exports = {
    type: 'get',
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res
    */
    async execute(req, res) {
        const { Routes } = require("discord.js")
        const { rest } = require("../../src")
        const user = await rest.get(Routes.user(req.query.userID))
        console.log(user)
        res.json({ response: Boolean(user.username !== "M4sk") })
    }
}