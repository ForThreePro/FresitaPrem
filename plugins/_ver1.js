import fs from 'fs'
const path = './database/horarios.json'

let db = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [] }
if (fs.existsSync(path)) try { db = JSON.parse(fs.readFileSync(path)) } catch {}

const nombres = {lunes:'Lunes', martes:'Martes', miercoles:'Miércoles', jueves:'Jueves', viernes:'Viernes', sabado:'Sábado'}
const tag = jid => '@' + jid.split('@')[0]

let handler = async (m, { conn }) => {
    let txt = `*📅 HORARIO DE IAS LUNES A SÁBADO*\n\n`
    let todos = []
    Object.keys(db).map(d => {
        txt += `*${nombres[d]}:*\n`
        if (db[d].length > 0) {
            db[d].map(j => { txt += `> ${tag(j)}\n`; todos.push(j) })
        } else txt += `> Sin asignar\n`
        txt += `\n`
    })
    await conn.sendMessage(m.chat, { text: txt, mentions: [...new Set(todos)] }, { quoted: m })
}

handler.help = ['ver1']
handler.tags = ['horario']
handler.command = /^ver1$/i
handler.group = true
export default handler