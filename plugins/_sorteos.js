let db = global.db.data.escalaSorteos = global.db.data.escalaSorteos || {}

let handler = async (m, { conn, isAdmin, command, args, groupMetadata }) => {
    if (!m.isGroup) return m.reply(`🍓 Solo en grupos fresita`)

    let user = `@${m.sender.split('@')[0]}`
    let chat = db[m.chat] = db[m.chat] || {lunes:[],martes:[],miercoles:[],jueves:[],viernes:[],sabado:[]}
    let dias = ['lunes','martes','miercoles','jueves','viernes','sabado']
    let emoji = {lunes:'🌙', martes:'💼', miercoles:'📊', jueves:'📢', viernes:'🎉', sabado:'🍓'}
    let participants = groupMetadata.participants

    const buscarUsuario = (texto) => {
        if (!texto) return null
        texto = texto.toLowerCase().replace(/[^0-9a-z]/g, '')
        if (m.mentionedJid[0]) return m.mentionedJid[0]
        if (m.quoted?.sender) return m.quoted.sender
        let porNumero = participants.find(p => p.id.includes(texto))
        if (porNumero) return porNumero.id
        let porNombre = participants.find(p => (p.name || p.notify || '').toLowerCase().replace(/[^0-9a-z]/g, '').includes(texto))
        if (porNombre) return porNombre.id
        return null
    }

    // =====.setlunes @usuario =====
    if (command.startsWith('set')) {
        if (!isAdmin) return m.reply(`🍓 *UPSITO* 🚫\nSolo las fresitas admin pueden ${user}`, m, { mentions: [m.sender] })
        let dia = command.replace('set','')
        if (!dias.includes(dia)) return

        let who = buscarUsuario(args.join(' '))
        if (!who) return m.reply(`🍓 *AY NO* \n${user} Menciona a tu fresita\n💡 *Ejemplo:*.set${dia} @usuario`, m, { mentions: [m.sender] })
        if (chat[dia].includes(who)) return m.reply(`🍓 *YA ESTA* \n${user} @${who.split('@')[0]} ya es fresita de *${dia.toUpperCase()}*`, m, { mentions: [m.sender, who] })

        chat[dia].push(who)
        let target = `@${who.split('@')[0]}`

        let txt = `🍓━━━━━━━━━━ *FRESITA BOT* ━━━━━━━━━━🍓

✨ *NUEVA FRESITA AGREGADA* ✨

${emoji[dia]} *DIA:* ${dia.toUpperCase()}
${emoji[dia]} *FRESITA:* ${target}
${emoji[dia]} *POSICION:* #${chat[dia].length}

👮 *REGISTRADO POR:* ${user}

> "Dulce como fresita, fuerte como jefa" 🍓💕`

        return conn.reply(m.chat, txt, m, { mentions: [m.sender, who] })
    }

    // =====.lunes =====
    if (dias.includes(command)) {
        let dia = command
        if (chat[dia].length === 0) return m.reply(`🍓 *CANASTA VACIA*\n${user}\nNo hay fresitas para *${dia.toUpperCase()}*`, m, { mentions: [m.sender] })

        let txt = `🍓━━━━━━━━━━ *ESCALA ${dia.toUpperCase()}* ━━━━━━━━━━🍓

👮 *CONSULTADO POR:* ${user}
🍓 *TOTAL FRESITAS:* ${chat[dia].length}

`
        let mentions = [m.sender,...chat[dia]]

        chat[dia].forEach((jid, i) => {
            txt += `🌸 ┃ *#${i+1}* ┃ @${jid.split('@')[0]}\n`
        })

        txt += `
┌─ *AVISITO IMPORTANTE* ─┐
│ 🍓 Hola Bebit@ Recuerda Hacer │
│ Tu Sorteo Y No Te Ganes Un │
│ Tache 🍓 │
└─────────────────────────┘

📸 *VERIFICACION:*
Para poder verificar tu sorteo envia @ a una admin tu sorteo realizado + cap

> "Las fresitas no fallan" 🍓✨`

        return conn.reply(m.chat, txt, m, { mentions: [...new Set(mentions)] })
    }

    // =====.limpiarlunes =====
    if (command.startsWith('limpiar')) {
        if (!isAdmin) return m.reply(`🍓 *UPSITO* 🚫\nSolo las fresitas admin pueden ${user}`, m, { mentions: [m.sender] })
        let dia = command.replace('limpiar','')
        if (!dias.includes(dia)) return

        let cantidad = chat[dia].length
        chat[dia] = []

        let txt = `🍓━━━━━━━━━━ *LIMPIEZA FRESITA* ━━━━━━━━━━🍓

🗑️ *CANASTA BORRADA* 🗑️

${emoji[dia]} *DIA:* ${dia.toUpperCase()}
🗑️ *ELIMINADAS:* ${cantidad} fresitas

👮 *EJECUTADO POR:* ${user}

> "Canasta limpia, semana dulce" 🍓`

        return m.reply(txt, m, { mentions: [m.sender] })
    }

    // =====.tabla =====
    if (command === 'tabla') {
        if (!isAdmin) return m.reply(`🍓 *UPSITO* 🚫\nSolo las fresitas admin pueden ${user}`, m, { mentions: [m.sender] })

        let txt = `🍓━━━━━━━━━━ *TABLA SEMANAL FRESITA* ━━━━━━━━━━🍓

👮 *GENERADO POR:* ${user}

`
        let mentions = [m.sender]
        dias.forEach(d => {
            txt += `━━━━━━━━━━━━━━━━━━━━━\n`
            txt += `${emoji[d]} *${d.toUpperCase()}* ┃ [${chat[d].length}]\n`
            if(chat[d].length > 0){
                chat[d].forEach((jid, i) => {
                    txt += ` ${i+1}. @${jid.split('@')[0]}\n`
                    mentions.push(jid)
                })
            } else {
                txt += ` └─ *Sin fresitas*\n`
            }
            txt += `\n`
        })

        txt += `━━━━━━━━━━━━━\n`
        txt += `> "7 dias, 7 fresitas, puro amor" 🍓💕`

        return conn.reply(m.chat, txt, m, { mentions: [...new Set(mentions)] })
    }

}
handler.help = ['setlunes @', 'lunes', 'limpiarlunes', 'tabla']
handler.tags = ['staff']
handler.command = ['setlunes','setmartes','setmiercoles','setjueves','setviernes','setsabado','lunes','martes','miercoles','jueves','viernes','sabado','limpiarlunes','limpiarmartes','limpiarmiercoles','limpiarjueves','limpiarviernes','limpiarsabado','tabla']
handler.group = true
export default handler