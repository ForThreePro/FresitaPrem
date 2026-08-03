const fs = require('fs')
const path = './database/horarios.json'

// Cargar BD
let horarios = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [] }
if (fs.existsSync(path)) horarios = JSON.parse(fs.readFileSync(path))

const save = () => fs.writeFileSync(path, JSON.stringify(horarios, null, 2))

const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
const diasConTilde = {lunes:"Lunes", martes:"Martes", miercoles:"Miércoles", jueves:"Jueves", viernes:"Viernes", sabado:"Sábado"}

let handler = async (m, { conn, command, args }) => {
    const mentions = m.mentionedJid || []
    const dia = command.replace('set', '').replace('ver', '')

    //.setlunes @persona
    if (command.startsWith('set')) {
        if (mentions.length === 0) return m.reply(`Uso:.set${dia} @persona1 @persona2`)
        horarios[dia] = mentions // sobrescribe
        save()
        return conn.sendMessage(m.chat, {
            text: `✅ Guardado para ${diasConTilde[dia]}`,
            mentions: mentions
        }, { quoted: m })
    }

    //.lunes.martes....sabado
    if (dias.includes(command)) {
        const personas = horarios[command]
        if (personas.length === 0) return m.reply(`*${diasConTilde[command]}*\nSin IA asignada`)

        return conn.sendMessage(m.chat, {
            text: `*${diasConTilde[command]}*\nIA Asignada:`,
            mentions: personas
        }, { quoted: m })
    }

    //.ver1
    if (command === 'ver1') {
        let texto = `*📅 HORARIO DE IAS LUNES A SÁBADO*\n\n`
        let todasLasMenciones = []

        dias.forEach(d => {
            const personas = horarios[d]
            texto += `*${diasConTilde[d]}:*\n`
            if (personas.length > 0) {
                personas.forEach(p => {
                    texto += `> @${p.split('@')[0]}\n`
                    todasLasMenciones.push(p)
                })
            } else {
                texto += `> Sin asignar\n`
            }
            texto += `\n`
        })

        return conn.sendMessage(m.chat, {
            text: texto,
            mentions: todasLasMenciones
        }, { quoted: m })
    }
}

handler.command = /^(setlunes|setmartes|setmiercoles|setjueves|setviernes|setsabado|lunes|martes|miercoles|jueves|viernes|sabado|ver1)$/i
handler.help = ['setlunes @tag', 'lunes', 'ver1']
handler.tags = ['horario']
handler.group = true // solo funciona en grupos

module.exports = handler