let dbSorteos = global.dbSorteos || (global.dbSorteos = {})

let handler = async (m, { conn, isAdmin, command, args }) => {
    if (!m.isGroup) return m.reply(`🎀 *BOT FRESITA* 🎀\n\n🌸 Este comando solo funciona en grupos 🌸`)
    if (!isAdmin) return m.reply(`🎀 *BOT FRESITA* 🎀\n\n💅 Solo admins pueden usar este comando preciosa`)

    let diasValidos = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
    let emojis = {lunes:'🌙', martes:'💖', miercoles:'🌷', jueves:'👀', viernes:'💕', sabado:'🎀', domingo:'🌹'}

    if (!dbSorteos[m.chat]) dbSorteos[m.chat] = {}
    diasValidos.forEach(d => { if (!dbSorteos[m.chat][d]) dbSorteos[m.chat][d] = [] })

    try {
        // ====== COMANDO:.verlunes.vermartes etc ======
        if (command.startsWith('ver')) {
            let dia = command.replace('ver','')
            if (!diasValidos.includes(dia)) return m.reply(`🎀 *BOT FRESITA* 🎀\n\n❌ Usa:.ver[lunes-domingo]\nEjemplo:.verlunes`)

            let lista = dbSorteos[m.chat][dia]
            if (lista.length === 0) return m.reply(`🎀 *BOT FRESITA* 🎀\n\n🌸 Awww no hay nadie anotado para el ${emojis[dia]} *${dia}* 🌸`)

            let txt = `🎀 *BOT FRESITA* 🎀

╭─── ⋆⋅ ♡ ⋅⋆ ───╮
  ${emojis[dia]} LISTA DE ${dia.toUpperCase()} ${emojis[dia]}
╰─── ⋆⋅ ♡ ⋅⋆ ───╯

🌷 ${lista.map((v,i) => `${i+1}. @${v.split('@')[0]} 💕`).join('\n🌷 ')}

╭─── ⋆⋅ ♡ ⋅⋆ ───╮
  💌 TOTAL: ${lista.length} preciosas 💌
╰─── ⋆⋅ ♡ ⋅⋆ ───╯
`
            await conn.reply(m.chat, txt, m, { mentions: lista })
            return
        }

        // ====== COMANDO:.tabla ======
        if (command === 'tabla') {
            await conn.sendMessage(m.chat, { react: { text: '📊', key: m.key } })
            let totalGeneral = 0
            let texto = `🎀 *BOT FRESITA* 🎀\n\n╭─── ⋆⋅ ♡ ⋅⋆ ───╮\n 📊 TABLA DE LA SEMANA 📊\n╰─── ⋆⋅ ♡ ⋅⋆ ───╯\n\n`

            diasValidos.forEach(d => {
                let lista = dbSorteos[m.chat][d]
                totalGeneral += lista.length
                texto += `${emojis[d]} *${d.toUpperCase()}*: ${lista.length} 💕\n`
                if(lista.length > 0) texto += ` ${lista.map((v,i) => `@${v.split('@')[0]}`).join(' | ')}\n\n`
            })
            texto += `╭─── ⋆⋅ ♡ ⋅⋆ ───╮\n 🌹 TOTAL GENERAL: ${totalGeneral} 🌹\n╰─── ⋆⋅ ♡ ⋅⋆ ───╯`
            await conn.reply(m.chat, texto, m, { mentions: Object.values(dbSorteos[m.chat]).flat() })
            return
        }

        // ====== COMANDO:.limpiar ======
        if (command === 'limpiar') {
            let target = args[0]?.toLowerCase()
            await conn.sendMessage(m.chat, { react: { text: '🗑️', key: m.key } })

            if (target === 'todo') {
                diasValidos.forEach(d => dbSorteos[m.chat][d] = [])
                return m.reply(`🎀 *BOT FRESITA* 🎀\n\n✨ Se limpió toda la semana ✨\nEmpezamos de 0 mi amor 🌸`)
            }
            if (!diasValidos.includes(target)) return m.reply(`🎀 *BOT FRESITA* 🎀\n\n❌ Usa:.limpiar[lunes-domingo] o.limpiar todo`)

            dbSorteos[m.chat][target] = []
            return m.reply(`🎀 *BOT FRESITA* 🎀\n\n💖 Se limpió la lista del ${emojis[target]} *${target}* 💖`)
        }

        // ====== COMANDOS:.lunes.martes etc SOLO RESPONDIENDO ======
        if (diasValidos.includes(command)) {
            let dia = command
            let lista = dbSorteos[m.chat][dia]

            if (!m.quoted) {
                return m.reply(`🎀 *BOT FRESITA* 🎀\n\n❌ Amorcito tienes que *responder al mensaje* de la persona\n\nEjemplo: Responde al mensaje de Pepito y pon.${dia} 🌷\n\n.${dia} @Pepito ← Esto no sirve`)
            }

            let jid = m.quoted.sender
            let yaEstaba = lista.includes(jid)

            if (!yaEstaba) lista.push(jid)
            await conn.sendMessage(m.chat, { react: { text: yaEstaba? '👀' : '💖', key: m.key } })

            let txt = `🎀 *BOT FRESITA* 🎀

╭─── ⋆⋅ ♡ ⋅⋆ ───╮
  ${emojis[dia]} ACTUALIZADO ${dia.toUpperCase()} ${emojis[dia]}
╰─── ⋆⋅ ♡ ⋅⋆ ───╯

${yaEstaba? `👀 *AVISO:* @${jid.split('@')[0]} ya estaba anotada 💅` : `💖 *NUEVA:* @${jid.split('@')[0]} fue agregada 🌷`}

╭─── ⋆⋅ LISTA ACTUAL ⋅⋆ ───╮
${lista.map((v,i) => `🌹 ${i+1}. @${v.split('@')[0]}`).join('\n')}
╰─────────────────╯

💌 TOTAL: ${lista.length} preciosas 💌
`
            await conn.reply(m.chat, txt, m, { mentions: lista })
            return
        }

    } catch (e) {
        await m.reply(`❌ ERROR: ${e.message}`)
    }
}

handler.help = ['lunes','verlunes','tabla','limpiar']
handler.tags = ['sorteo']
handler.command = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo','verlunes','vermartes','vermiercoles','verjueves','viernes','versabado','verdomingo','tabla','limpiar']
handler.admin = true
export default handler