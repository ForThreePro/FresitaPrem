import fs from 'fs'
const path = './database/horarios.json'

let horarios = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [] }
if (fs.existsSync(path)) {
    try { horarios = JSON.parse(fs.readFileSync(path)) } catch {}
}

const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
const nombres = {lunes:"Lunes", martes:"Martes", miercoles:"Miércoles", jueves:"Jueves", viernes:"Viernes", sabado:"Sábado"}
const tag = jid => '@' + jid.split('@')[0]

let handler = async (m, { conn }) => {
    let txt = `*📅 HORARIO DE IAS LUNES A SÁBADO*\n\n`
    let todos = []
    dias.forEach(d => {
        txt += `*${nombres[d]}:*\n`
        let personas = Array.isArray(horarios[d])? horarios[d] : []
        if (personas.length > 0) {
            personas.forEach(p => { txt += `> ${tag(p)}\n`; todos.push(p) })
        } else txt += `> Sin asignar\n`
        txt += `\n`
    })
    return await conn.sendMessage(m.chat, { text: txt, mentions: [...new Set(todos)] }, { quoted: m })
}

handler.help = ['ver1']
handler.tags = ['horario']
handler.command = ['ver1']
handler.group = true

export default handler