let dbSorteos = global.dbSorteos || (global.dbSorteos = {})

let handler = async (m, { conn, isAdmin, command, args }) => {
    if (!m.isGroup) return m.reply(`🎀 *BOT FRESITA* 🎀\n\n🌸 Este comando solo funciona en grupos 🌸`)

    let user = `@${m.sender.split('@')[0]}`
    let diasValidos = ['lunes','martes','miercoles','jueves','viernes','sabado']
    let emojis = {lunes:'🌙', martes:'💖', miercoles:'🌷', jueves:'👀', viernes:'💕', sabado:'🎀'}

    if (!dbSorteos[m.chat]) dbSorteos[m.chat] = {}
    diasValidos.forEach(d => { if (!dbSorteos[m.chat][d]) dbSorteos[m.chat][d] = [] })

    try {
        // ====== COMANDO:.lunes.martes.miercoles = VER LISTA ======
        if (diasValidos.includes(command)) {
            let dia = command
            let lista = dbSorteos[m.chat][dia]
            if (lista.length === 0) return m.reply(`🎀 *BOT FRESITA* 🎀\n\n🌸 ${user} Awww no hay nadie anotado para el ${emojis[dia]} *${dia}* 🌸`, m, {mentions:[m.sender]})

            let txt = `🎀 *BOT FRESITA* 🎀

╭─── ⋆⋅ ♡ ⋅⋆ ───╮
  ${emojis[dia]} LISTA DE ${dia.toUpperCase()} ${emojis[dia]}
╰─── ⋆⋅ ♡ ⋅⋆ ───╯

${user} está revisando 💅

🌷 ${lista.map((v,i) => `${i+1}. @${v.split('@')[0]} 💕`).join('\n🌷 ')}

╭─── ⋆⋅ ♡ ⋅⋆ ───╮
  💌 TOTAL: ${lista.length} preciosas 💌
╰─── ⋆⋅ ♡ ⋅⋆ ───╯
`
            await conn.reply(m.chat, txt, m, { mentions: lista.concat(m.sender) })
            return
        }

        // ====== COMANDO:.setlunes.setmartes = AGREGAR RESPONDIENDO ======
        if (command.startsWith('set')) {
            if (!isAdmin) return m.reply(`🎀 *BOT FRESITA* 🎀\n\n💅 Solo admins ${user}`, m, {mentions:[m.sender]})
            let dia = command.replace('set','')
            if (!diasValidos.includes(dia)) return

            if (!m.quoted) {
                return m.reply(`🎀 *BOT FRESITA* 🎀\n\n❌ ${user} tienes que *responder al mensaje* de la persona\nEjemplo: Responde al mensaje y pon.set${dia} 🌷`, m, {mentions:[m.sender]})
            }

            let jid = m.quoted.sender || m.quoted.participant
            let lista = dbSorteos[m.chat][dia]
            let yaEstaba = lista.includes(jid)

            if (!yaEstaba) lista.push(jid)
            await conn.sendMessage(m.chat, { react: { text: yaEstaba? '👀' : '💖', key: m.key } })

            let txt = `🎀 *BOT FRESITA* 🎀

╭─── ⋆⋅ ♡ ⋅⋆ ───╮
  ${emojis[dia]} ACTUALIZADO ${dia.toUpperCase()} ${emojis[dia]}
╰─── ⋆⋅ ♡ ⋅⋆ ───╯

${user}

${yaEstaba? `👀 *AVISO:* @${jid.split('@')[0]} ya estaba anotada 💅` : `💖 *NUEVA:* @${jid.split('@')[0]} fue agregada 🌷`}

╭─── ⋆⋅ LISTA ACTUAL ⋅⋆ ───╮
${lista.map((v,i) => `🌹 ${i+1}. @${v.split('@')[0]}`).join('\n')}
╰─────────────────╯

💌 TOTAL: ${lista.length} preciosas 💌
`
            await conn.reply(m.chat, txt, m, { mentions: lista.concat(m.sender) })
            return
        }

        // ====== COMANDO:.tabla ======
        if (command === 'tabla') {
            if (!isAdmin) return m.reply(`🎀 *BOT FRESITA* 🎀\n\n💅 Solo admins ${user}`, m, {mentions:[m.sender]})
            await conn.sendMessage(m.chat, { react: { text: '📊', key: m.key } })
            let totalGeneral = 0
            let texto = `🎀 *BOT FRESITA* 🎀\n\n╭─── ⋆⋅ ♡ ⋅⋆ ───╮\n 📊 TABLA LUNES A SÁBADO 📊\n╰─── ⋆⋅ ♡ ⋅⋆ ───╯\n\n${user}\n\n`

            let todos = []
            diasValidos.forEach(d => {
                let lista = dbSorteos[m.chat][d]
                totalGeneral += lista.length
                texto += `${emojis[d]} *${d.toUpperCase()}*: ${lista.length} 💕\n`
                if(lista.length > 0) {
                    texto += ` ${lista.map((v,i) => `@${v.split('@')[0]}`).join(' | ')}\n\n`
                    todos.push(...lista)
                }
            })
            texto += `╭─── ⋆⋅ ♡ ⋅⋆ ───╮\n 🌹 TOTAL GENERAL: ${totalGeneral} 🌹\n╰─── ⋆⋅ ♡ ⋅⋆ ───╯`
            await conn.reply(m.chat, texto, m, { mentions: [...new Set(todos.concat(m.sender))] })
            return
        }

        // ====== COMANDO:.limpiar ======
        if (command === 'limpiar') {
            if (!isAdmin) return m.reply(`🎀 *BOT FRESITA* 🎀\n\n💅 Solo admins ${user}`, m, {mentions:[m.sender]})
            let target = args[0]?.toLowerCase()
            await conn.sendMessage(m.chat, { react: { text: '🗑️', key: m.key } })

            if (target === 'todo') {
                diasValidos.forEach(d => dbSorteos[m.chat][d] = [])
                return m.reply(`🎀 *BOT FRESITA* 🎀\n✨ ${user} limpió toda la semana ✨\nDe lunes a sábado 🌸`, m, {mentions:[m.sender]})
            }
            if (!diasValidos.includes(target)) return m.reply(`🎀 *BOT FRESITA* 🎀\n❌ Usa:.limpiar[lunes-sabado] o.limpiar todo ${user}`, m, {mentions:[m.sender]})

            dbSorteos[m.chat][target] = []
            return m.reply(`🎀 *BOT FRESITA* 🎀\n\n💖 ${user} limpió la lista del ${emojis[target]} *${target}* 💖`, m, {mentions:[m.sender]})
        }

    } catch (e) {
        await m.reply(`❌ ERROR: ${e.message}`)
    }
}

handler.help = [
'📅 *BOT FRESITA - SORTEOS* 📅',
'setlunes ( Responde Al Mensaje )',
'setmartes ( Responde Al Mensaje )',
'setmiercoles ( Responde Al Mensaje )',
'setjueves ( Responde Al Mensaje )',
'setviernes ( Responde Al Mensaje )',
'setsabado ( Responde Al Mensaje )',
'lunes ( Ver Lista Lunes )',
'martes ( Ver Lista Martes )',
'miercoles ( Ver Lista Miércoles )',
'jueves ( Ver Lista Jueves )',
'viernes ( Ver Lista Viernes )',
'sabado ( Ver Lista Sábado )',
'tabla ( Ver Días Completos )',
'limpiar (lunes, martes... )',
'limpiar todo'
]
handler.tags = ['sorteo']
handler.command = ['setlunes','setmartes','setmiercoles','setjueves','setviernes','setsabado','lunes','martes','miercoles','jueves','viernes','sabado','tabla','limpiar']
handler.admin = false
export default handler