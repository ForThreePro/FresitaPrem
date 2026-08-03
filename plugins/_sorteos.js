let fs = require('fs')
let path = './database/horarios.json'

if (!fs.existsSync('./database')) fs.mkdirSync('./database')
let horarios = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [] }
if (fs.existsSync(path)) horarios = JSON.parse(fs.readFileSync(path))

const save = () => fs.writeFileSync(path, JSON.stringify(horarios, null, 2))
const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
const nombres = {lunes:"Lunes", martes:"Martes", miercoles:"Miércoles", jueves:"Jueves", viernes:"Viernes", sabado:"Sábado"}

let handler = async (m, { conn, command }) => {
    // Esto agarra menciones en todas las bases
    let mentions = m.mentionedJid || (m.quoted? [m.quoted.sender] : []) || []

    let dia = command.replace('set', '')

    if (command.startsWith('set')) {
        if (mentions.length == 0) return m.reply(`*Uso:*.set${dia} @persona1 @persona2\n\nTienes que mencionar tocando el nombre`)
        horarios[dia] = mentions
        save()
        return conn.sendMessage(m.chat, { text: `✅ Guardado para *${nombres[dia]}*`, mentions }, { quoted: m })
    }

    if (dias.includes(command)) {
        let personas = horarios[command]
        if (!personas || personas.length == 0) return m.reply(`*${nombres[command]}*\nSin IA asignada`)
        return conn.sendMessage(m.chat, { text: `*${nombres[command]}*\nIA Asignada:`, mentions: personas }, { quoted: m })
    }

    if (command == 'ver1') {
        let txt = `*📅 HORARIO DE IAS LUNES A SÁBADO*\n\n`
        let todos = []
        dias.map(d => {
            txt += `*${nombres[d]}:*\n`
            if (horarios[d].length > 0) {
                horarios[d].map(p => { txt += `> @${p.split('@')[0]}\n`; todos.push(p) })
            } else txt += `> Sin asignar\n`
            txt += `\n`
        })
        return conn.sendMessage(m.chat, { text: txt, mentions: todos }, { quoted: m })
    }
}

handler.command = new RegExp // asi lo lee cualquier base
handler.command = /^(setlunes|setmartes|setmiercoles|setjueves|setviernes|setsabado|lunes|martes|miercoles|jueves|viernes|sabado|ver1)$/i
handler.help = ['setlunes @tag', 'lunes', 'ver1']
handler.tags = ['horario']
handler.group = true

module.exports = handler