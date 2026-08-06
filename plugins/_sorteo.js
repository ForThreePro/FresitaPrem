let dbSorteos = global.dbSorteos || (global.dbSorteos = {})

let handler = async (m, { conn, isAdmin, command, args }) => {
    if (!m.isGroup) return m.reply(`🎀 *BOT FRESITA* 🎀\n\n🌸 Este comando solo funciona en grupos 🌸`)

    let user = `@${m.sender.split('@')[0]}` // MENCION IGUAL QUE EN JUEGOS
    let diasValidos = ['lunes','martes','miercoles','jueves','viernes','sabado'] // SIN DOMINGO
    let emojis = {lunes:'🌙', martes:'💖', miercoles:'🌷', jueves:'👀', viernes:'💕', sabado:'🎀'}

    if (!dbSorteos[m.chat]) dbSorteos[m.chat] = {}
    diasValidos.forEach(d => { if (!dbSorteos[m.chat][d]) dbSorteos[m.chat][d] = [] })

    try {
        // ====== COMANDO:.verlunes.vermartes etc ======
        if (command.startsWith('ver')) {
            let dia = command.replace('ver','')
            if (!diasValidos.includes(dia)) return m.reply(`🎀 *BOT FRESITA* 🎀\n\n❌ Usa:.ver[lunes-sabado] ${user}`, m, {mentions:[m.sender]})

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

        // ====== COMANDOS:.lunes.martes etc SOLO RESPONDIENDO ======
        if (diasValidos.includes(command)) {
            if (!isAdmin) return m.reply(`🎀 *BOT FRESITA* 🎀\n\n💅 Solo admins ${user}`, m, {mentions:[m.sender]})
            let dia = command
            let lista = dbSorteos[m.chat][dia]

            if (!m.quoted) {
                return m.reply(`🎀 *BOT FRESITA* 🎀\n\n❌ ${user} tienes que *responder al mensaje* de la persona\n\nEjemplo: Responde al mensaje de Pepito y pon.${dia} 🌷`, m, {mentions:[m.sender]})
            }

            let jid = m.quoted.sender
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

    } catch (e) {
        await m.reply(`❌ ERROR: ${e.message}`)
    }
}

// HELP SIN DOMINGO 🍓
handler.help = [
'lunes ( Responde Al Mensaje )',
'martes ( Responde Al Mensaje )',
'miercoles ( Responde Al Mensaje )',
'jueves ( Responde Al Mensaje )',
'viernes ( Responde Al Mensaje )',
'sabado ( Responde Al Mensaje )',
'verlunes ( Ver Día Lunes )',
'vermartes ( Ver Día Martes )',
'vermiercoles ( Ver Día Miércoles )',
'verjueves ( Ver Día Jueves )',
'veviernes ( Ver Día Viernes )',
'versabado ( Ver Día Sábado )',
'tabla ( Ver Días Completos )',
'limpiar (lunes, martes, miercoles, etc )',
'limpiar todo'
]
handler.tags = ['sorteo']
handler.command = ['lunes','martes','miercoles','jueves','viernes','sabado','verlunes','vermartes','vermiercoles','verjueves','verviernes','versabado','tabla','limpiar'] // Arreglé el "viernes" duplicado
handler.admin = false // El control de admin ya está manual arriba
export default handler