let dbSorteos = global.dbSorteos || (global.dbSorteos = {})

let handler = async (m, { conn, isAdmin, command, args }) => {
    if (!m.isGroup) return m.reply(`*🍓 BOT FRESITA*\n\n❌ Este comando solo funciona en grupos`)
    if (!isAdmin) return m.reply(`*🍓 BOT FRESITA*\n\n❌ Solo admins pueden usar este comando`)

    let diasValidos = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
    let dia = command.toLowerCase()

    // Inicializar grupo
    if (!dbSorteos[m.chat]) dbSorteos[m.chat] = {}
    diasValidos.forEach(d => { if (!dbSorteos[m.chat][d]) dbSorteos[m.chat][d] = [] })

    try {
        // ====== COMANDO:.tabla ======
        if (command === 'tabla') {
            await conn.sendMessage(m.chat, { react: { text: '📊', key: m.key } })
            let totalGeneral = 0
            let texto = `*🍓 BOT FRESITA*\n\n╭─「 📊 TABLA DE LA SEMANA 」─╮\n│\n`

            diasValidos.forEach(d => {
                let lista = dbSorteos[m.chat][d]
                totalGeneral += lista.length
                texto += `│ 📅 ${d.toUpperCase()}: ${lista.length} personas\n`
                if(lista.length > 0) {
                    texto += `│ ${lista.map((v,i) => `${i+1}. @${v.split('@')[0]}`).join(' | ')}\n`
                }
                texto += `│\n`
            })

            texto += `│ *TOTAL GENERAL:* ${totalGeneral} personas\n╰─────────────────────────────╯\n\n> *"Todos listos para el sorteo"*`
            await conn.reply(m.chat, texto, m, { mentions: Object.values(dbSorteos[m.chat]).flat() })
            return
        }

        // ====== COMANDO:.limpiar ======
        if (command === 'limpiar') {
            let target = args[0]?.toLowerCase()
            await conn.sendMessage(m.chat, { react: { text: '🗑️', key: m.key } })

            if (target === 'todo') {
                diasValidos.forEach(d => dbSorteos[m.chat][d] = [])
                return m.reply(`*🍓 BOT FRESITA*\n\n✅ Se ha limpiado *TODA LA SEMANA*. Listo para empezar de 0`)
            }

            if (!diasValidos.includes(target)) return m.reply(`❌ Usa:.limpiar [lunes-domingo] o.limpiar todo`)

            dbSorteos[m.chat][target] = []
            return m.reply(`*🍓 BOT FRESITA*\n\n✅ Se ha limpiado la lista del día *${target}*`)
        }

        // ====== COMANDOS:.lunes a.domingo ======
        if (diasValidos.includes(dia)) {
            let lista = dbSorteos[m.chat][dia]
            let agregar = []

            // 1. Si mencionas
            if (m.mentionedJid.length > 0) {
                agregar.push(...m.mentionedJid)
            }
            // 2. Si respondes
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
            return
        }

    } catch (e) {
        await m.reply(`❌ ERROR: ${e.message}`)
    }
}

handler.help = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo','tabla','limpiar']
handler.tags = ['sorteo']
handler.command = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo','tabla','limpiar']
handler.admin = true
export default handler