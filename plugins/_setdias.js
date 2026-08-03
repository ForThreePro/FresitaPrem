import fs from 'fs'
const path = './database/horarios.json'

if (!fs.existsSync('./database')) fs.mkdirSync('./database')
let db = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [] }
if (fs.existsSync(path)) try { db = JSON.parse(fs.readFileSync(path)) } catch {}
const save = () => fs.writeFileSync(path, JSON.stringify(db, null, 2))

const mapa = { addlunes:'lunes', addmartes:'martes', addmiercoles:'miercoles', addjueves:'jueves', addviernes:'viernes', addsabado:'sabado' }
const nombres = {lunes:'Lunes', martes:'Martes', miercoles:'Miércoles', jueves:'Jueves', viernes:'Viernes', sabado:'Sábado'}
const tag = jid => '@' + jid.split('@')[0]

let handler = async (m, { conn, command }) => {
    let dia = mapa[command]
    let mentions = m.mentionedJid || m.msg?.contextInfo?.mentionedJid || []

    if (mentions.length == 0) return m.reply(`*Uso:*.${command} @persona1 @persona2`)

    db[dia] = mentions
    save()
    await conn.sendMessage(m.chat, {
        text: `✅ *${nombres[dia]}* guardado:\n${mentions.map(tag).join(' ')}`,
        mentions
    }, { quoted: m })
}

handler.help = ['addlunes @tag']
handler.tags = ['horario']
handler.command = /^add(lunes|martes|miercoles|jueves|viernes|sabado)$/i
handler.group = true
export default handler