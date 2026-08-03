let fs = require('fs')
let path = './database/horarios.json'

if (!fs.existsSync('./database')) fs.mkdirSync('./database')
let horarios = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [] }
if (fs.existsSync(path)) horarios = JSON.parse(fs.readFileSync(path))

const save = () => fs.writeFileSync(path, JSON.stringify(horarios, null, 2))
const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
const nombres = {lunes:"Lunes", martes:"Martes", miercoles:"Miércoles", jueves:"Jueves", viernes:"Viernes", sabado:"Sábado"}

let handler = async (m, { conn, usedPrefix, command, args }) => {

    // Agarra menciones de 3 formas distintas por si acaso
    let mentions = m.mentionedJid || m.msg?.contextInfo?.mentionedJid || []

    let dia = command.replace('set', '')

    if (command.startsWith('set')) {
        if (mentions.length == 0) throw `Ejemplo: ${usedPrefix}set${dia} @persona`

        horarios[dia] = [...new Set(mentions)] // quita duplicados
        save()

        let txt = `✅ Guardado para *${nombres[dia]}*:\n`
        return conn.sendMessage(m.chat, { text: txt, mentions: mentions }, { quoted: m })
    }

    if (dias.includes(command)) {
        let personas = horarios[command]
        if (personas.length == 0) return m.reply(`*${nombres[command]}*\nSin IA asignada`)

        let txt = `*${nombres[command]}*\nIA Asignada:\n`
        return conn.sendMessage(m.chat, { text: txt, mentions: personas }, { quoted: m })
    }

    if (command == 'ver1') {
        let txt = `*📅 HORARIO DE IAS LUNES A SÁBADO*\n\n`
        let todos = []
        for (let d of dias) {
            txt += `*${nombres[d]}:*\n`
            if (horarios[d].length > 0) {
                horarios[d].forEach(p => {
                    txt += `> @${p.split('@')[0]}\n`
                    todos.push(p)
                })
            } else txt += `> Sin asignar\n`
            txt += `\n`
        }
        return conn.sendMessage(m.chat, { text: txt, mentions: todos }, { quoted: m })
    }
}

handler.help = ['setlunes @tag', 'lunes', 'ver1']
handler.tags = ['horario']
handler.command = /^(setlunes|setmartes|setmiercoles|setjueves|setviernes|setsabado|lunes|martes|miercoles|jueves|viernes|sabado|ver1)$/i
handler.group = true
handler.admin = false // pon true si solo quieres que admins lo usen

module.exports = handler