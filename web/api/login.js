module.exports = {
    type: 'post',
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res
    */
    async execute(req, res) {
        const { Routes } = require("discord.js")
        const { rest } = require("../../src")
        console.log(req.body)
        res.send('Successfully logged in!')
    }
}