import fs from 'fs'
const path = './database/horarios.json'

if (!fs.existsSync('./database')) fs.mkdirSync('./database')
let horarios = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [] }
if (fs.existsSync(path)) horarios = JSON.parse(fs.readFileSync(path))

const save = () => fs.writeFileSync(path, JSON.stringify(horarios, null, 2))
const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
const nombres = {lunes:"Lunes", martes:"Martes", miercoles:"Miércoles", jueves:"Jueves", viernes:"Viernes", sabado:"Sábado"}
const tag = jid => '@' + jid.split('@')[0]

let handler = async (m, { conn, command, args, usedPrefix }) => {
    let mentions = m.mentionedJid || m.msg?.contextInfo?.mentionedJid || []
    let dia = args[0] // ahora el día viene por argumento

    //.set horario lunes @pepito
    if (command == 'set' || command == 'set horario') {
        if (!dia ||!dias.includes(dia)) return m.reply(`*Uso:* ${usedPrefix}set horario [dia] @persona\n*Ejemplo:* ${usedPrefix}set horario lunes @pepito`)
        if (mentions.length == 0) return m.reply(`Tienes que mencionar a alguien tocando el nombre`)

        horarios[dia] = mentions
        save()
        return await conn.sendMessage(m.chat, {
            text: `✅ Guardado para *${nombres[dia]}*:\n${mentions.map(tag).join(' ')}`,
            mentions
        }, { quoted: m })
    }

    //.ver horario lunes
    if (command == 'ver' || command == 'ver horario') {
        if (dia == '1' || dia == 'todo') { //.ver horario 1
            let txt = `*📅 HORARIO DE IAS LUNES A SÁBADO*\n\n`
            let todos = []
            dias.forEach(d => {
                txt += `*${nombres[d]}:*\n`
                if (horarios[d].length > 0) {
                    horarios[d].forEach(p => { txt += `> ${tag(p)}\n`; todos.push(p) })
                } else txt += `> Sin asignar\n`
                txt += `\n`
            })
            return await conn.sendMessage(m.chat, { text: txt, mentions: [...new Set(todos)] }, { quoted: m })
        }

        //.ver horario lunes
        if (!dia ||!dias.includes(dia)) return m.reply(`*Uso:* ${usedPrefix}ver horario [dia]\n*Ejemplo:* ${usedPrefix}ver horario lunes`)
        let personas = horarios[dia]
        if (!personas || personas.length == 0) return m.reply(`*${nombres[dia]}*\nSin IA asignada`)
        let texto = `*${nombres[dia]}*\nIA Asignada:\n${personas.map(tag).join('\n')}`
        return await conn.sendMessage(m.chat, { text: texto, mentions: personas }, { quoted: m })
    }
}

handler.help = ['set horario [dia] @tag', 'ver horario [dia]', 'ver horario 1']
handler.tags = ['horario']
handler.command = /^(set|sethorario|ver|verhorario)$/i
handler.group = true

export default handler