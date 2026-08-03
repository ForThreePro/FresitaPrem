import fs from 'fs'
const path = './database/horarios.json'

if (!fs.existsSync('./database')) fs.mkdirSync('./database')
let horarios = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [] }
if (fs.existsSync(path)) {
    try { horarios = JSON.parse(fs.readFileSync(path)) } catch {}
}
const save = () => fs.writeFileSync(path, JSON.stringify(horarios, null, 2))

const dias = { setlunes:"lunes", setmartes:"martes", setmiercoles:"miercoles", setjueves:"jueves", setviernes:"viernes", setsabado:"sabado" }
const nombres = {lunes:"Lunes", martes:"Martes", miercoles:"Miércoles", jueves:"Jueves", viernes:"Viernes", sabado:"Sábado"}
const tag = jid => '@' + jid.split('@')[0]

let handler = async (m, { conn, command }) => {
    let mentions = m.mentionedJid || m.msg?.contextInfo?.mentionedJid || []
    let dia = dias[command]

    if (mentions.length == 0) return m.reply(`*Uso:*.${command} @persona1 @persona2`)

    horarios[dia] = mentions
    save()
    return await conn.sendMessage(m.chat, {
        text: `✅ Guardado para *${nombres[dia]}*:\n${mentions.map(tag).join(' ')}`,
        mentions
    }, { quoted: m })
}

handler.help = ['setlunes @tag', 'setsabado @tag']
handler.tags = ['horario']
handler.command = ['setlunes','setmartes','setmiercoles','setjueves','setviernes','setsabado']
handler.group = true

export default handler