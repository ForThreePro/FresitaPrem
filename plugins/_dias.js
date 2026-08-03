import fs from 'fs'
const path = './database/horarios.json'

let horarios = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [] }
if (fs.existsSync(path)) {
    try { horarios = JSON.parse(fs.readFileSync(path)) } catch {}
}

const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
const nombres = {lunes:"Lunes", martes:"Martes", miercoles:"Miércoles", jueves:"Jueves", viernes:"Viernes", sabado:"Sábado"}
const tag = jid => '@' + jid.split('@')[0]

let handler = async (m, { conn, command }) => {
    if (!dias.includes(command)) return

    let personas = Array.isArray(horarios[command])? horarios[command] : []
    if (personas.length == 0) return m.reply(`*${nombres[command]}*\nSin IA asignada`)

    let texto = `*${nombres[command]}*\nIA Asignada:\n${personas.map(tag).join('\n')}`
    return await conn.sendMessage(m.chat, { text: texto, mentions: personas }, { quoted: m })
}

handler.help = ['lunes', 'sabado']
handler.tags = ['horario']
handler.command = ['lunes','martes','miercoles','jueves','viernes','sabado']
handler.group = true

export default handler