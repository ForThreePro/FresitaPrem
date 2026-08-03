import fs from 'fs'
const path = './database/horarios.json'

if (!fs.existsSync('./database')) fs.mkdirSync('./database')
let horarios = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [] }
if (fs.existsSync(path)) horarios = JSON.parse(fs.readFileSync(path))

const save = () => fs.writeFileSync(path, JSON.stringify(horarios, null, 2))
const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
const nombres = {lunes:"Lunes", martes:"Martes", miercoles:"Miércoles", jueves:"Jueves", viernes:"Viernes", sabado:"Sábado"}
const tag = jid => '@' + jid.split('@')[0]

let handler = async (m, { conn, command, usedPrefix }) => {
    let mentions = m.mentionedJid || m.msg?.contextInfo?.mentionedJid || []

    if (command.startsWith('set')) {
        let dia = command.replace('set', '')
        if (mentions.length == 0) return m.reply(`*Uso:* ${usedPrefix}set${dia} @persona1 @persona2`)

        horarios[dia] = mentions
        save()
        return await conn.sendMessage(m.chat, {
            text: `✅ Guardado para *${nombres[dia]}*:\n${mentions.map(tag).join(' ')}`,
            mentions
        }, { quoted: m })
    }

    if (dias.includes(command)) {
        let personas = horarios[command]
        if (!personas || personas.length == 0) return m.reply(`*${nombres[command]}*\nSin IA asignada`)

        let texto = `*${nombres[command]}*\nIA Asignada:\n${personas.map(tag).join('\n')}`
        return await conn.sendMessage(m.chat, { text: texto, mentions: personas }, { quoted: m })
    }

    if (command == 'ver1') {
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
}

handler.help = ['setlunes @tag', 'lunes', 'ver1']
handler.tags = ['horario']
handler.command = [
    'setlunes','setmartes','setmiercoles','setjueves','setviernes','setsabado',
    'lunes','martes','miercoles','jueves','viernes','sabado','ver1'
]
handler.group = true

export default handler