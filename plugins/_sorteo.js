let dbSorteos = global.dbSorteos || (global.dbSorteos = {})

let handler = async (m, { conn, isAdmin, command }) => {
    if (!m.isGroup) return m.reply(`*🍓 BOT FRESITA*\n\n❌ Este comando solo funciona en grupos`)
    if (!isAdmin) return m.reply(`*🍓 BOT FRESITA*\n\n❌ Solo admins pueden usar este comando`)

    let dia = command.toLowerCase()
    let diasValidos = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
    if (!diasValidos.includes(dia)) return m.reply(`❌ Día no válido`)

    if (!dbSorteos[m.chat]) dbSorteos[m.chat] = {}
    if (!dbSorteos[m.chat][dia]) dbSorteos[m.chat][dia] = []

    let lista = dbSorteos[m.chat][dia]
    let agregar = []

    try {
        // 1. Si mencionas: @Pepito @Juana
        if (m.mentionedJid.length > 0) {
            agregar.push(...m.mentionedJid)
        }

        // 2. Si respondes a un mensaje: se agarra al autor del mensaje
        if (m.quoted) {
            agregar.push(m.quoted.sender)
        }

        agregar = [...new Set(agregar)] // quitar repetidos

        // SI HAY GENTE PARA AGREGAR
        if (agregar.length > 0) {
            let nuevos = agregar.filter(jid =>!lista.includes(jid))
            lista.push(...nuevos)

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

            let txt = `*🍓 BOT FRESITA*

╭─「 📅 SORTEO ${dia.toUpperCase()} 」─╮
│
│ *AGREGADOS:* ${nuevos.length}
${nuevos.map(v => `│ 👉 @${v.split('@')[0]}`).join('\n')}
│
│ *TOTAL EN ${dia}:* ${lista.length} personas
╰──────────────────────────╯

> *"Anotado para el sorteo"*
`
            await conn.reply(m.chat, txt, m, { mentions: nuevos })

        // SI NO HAY GENTE = MOSTRAR LISTA
        } else {
            if (lista.length === 0) return m.reply(`*🍓 BOT FRESITA*\n\n📭 No hay nadie registrado para el día *${dia}*`)

            let txt = `*🍓 BOT FRESITA*

╭─「 📋 LISTA ${dia.toUpperCase()} 」─╮
│
${lista.map((v,i) => `│ ${i+1}. @${v.split('@')[0]}`).join('\n')}
│
│ *TOTAL:* ${lista.length} personas
╰──────────────────────────╯

> *"Lista lista para el sorteo"*
`
            await conn.reply(m.chat, txt, m, { mentions: lista })
        }

    } catch (e) {
        await m.reply(`❌ ERROR: ${e.message}`)
    }
}

handler.help = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
handler.tags = ['sorteo']
handler.command = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
handler.admin = true
export default handler