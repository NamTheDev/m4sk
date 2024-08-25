const { Collection } = require('discord.js')
const express = require('express')
const { readdirSync, readFileSync } = require('fs')
const path = require('path')
const app = express()
const PORT = 3000

readdirSync('web/pages')
    .forEach(
        filePath => {
            app.get(`/${filePath.split('.')[0]}`,
                (req, res) =>
                    res.send(readFileSync(`web/pages/${filePath}`, 'utf-8')
                    )
            )
        }
    )

readdirSync('web/api')
    .forEach(
        filePath => {
            app.get(`/api/${filePath.split('.')[0]}`,
                async (req, res) =>
                    await require(path.join(process.cwd(), 'web', 'api', filePath))(req, res)
            )
        }
    )

app.get('/*', (req, res) => res.redirect('/check'))

app.listen(PORT, () => {
    console.log(`Web started. (DEV: http://localhost:${PORT})`)
})