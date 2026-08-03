import fs from 'fs'
const path = './database/horarios.json'

let db = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [] }
if (fs.existsSync(path)) try { db = JSON.parse(fs.readFileSync(path)) } catch {}

const dias = ['lunes','martes','miercoles','jueves','viernes','sabado']
const nombres = {lunes:'Lunes', martes:'Martes', miercoles:'Miércoles', jueves:'Jueves', viernes:'Viernes', sabado:'Sábado'}
const tag = jid => '@' + jid.split('@')[0]

let handler = async (m, { conn, command }) => {
    if (db[command].length == 0) return m.reply(`*${nombres[command]}*\nSin IA asignada`)

    let lista = db[command].map(tag).join('\n')
    await conn.sendMessage(m.chat, { text: `*${nombres[command]}*\nIA Asignada:\n${lista}`, mentions: db[command] }, { quoted: m })
}

handler.help = ['lunes']
handler.tags = ['horario']
handler.command = /^(lunes|martes|miercoles|jueves|viernes|sabado)$/i
handler.group = true
export default handler