let dbSorteos = global.dbSorteos || (global.dbSorteos = {})

let handler = async (m, { conn, isAdmin, command, args }) => {
    if (!m.isGroup) return m.reply(`*🍓 BOT FRESITA*\n\n❌ Este comando solo funciona en grupos`)
    if (!isAdmin) return m.reply(`*🍓 BOT FRESITA*\n\n❌ Solo admins pueden usar este comando`)

    let diasValidos = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']

    // Inicializar grupo
    if (!dbSorteos[m.chat]) dbSorteos[m.chat] = {}
    diasValidos.forEach(d => { if (!dbSorteos[m.chat][d]) dbSorteos[m.chat][d] = [] })

    try {
        // ====== COMANDO:.ver [dia] ======
        if (command === 'ver') {
            let dia = args[0]?.toLowerCase()
            if (!diasValidos.includes(dia)) return m.reply(`❌ Usa:.ver [lunes-domingo]\nEjemplo:.ver lunes`)

            let lista = dbSorteos[m.chat][dia]
            if (lista.length === 0) return m.reply(`*🍓 BOT FRESITA*\n\n📭 No hay nadie registrado para el día *${dia}*`)

            let txt = `*🍓 BOT FRESITA*

╭─「 📋 LISTA ${dia.toUpperCase()} 」─╮
│
${lista.map((v,i) => `│ ${i+1}. @${v.split('@')[0]}`).join('\n')}
│
│ *TOTAL:* ${lista.length} personas
╰──────────────────────────╯`
            await conn.reply(m.chat, txt, m, { mentions: lista })
            return
        }

        // ====== COMANDO:.tabla ======
        if (command === 'tabla') {
            await conn.sendMessage(m.chat, { react: { text: '📊', key: m.key } })
            let totalGeneral = 0
            let texto = `*🍓 BOT FRESITA*\n\n╭─「 📊 TABLA DE LA SEMANA 」─╮\n│\n`
            diasValidos.forEach(d => {
                let lista = dbSorteos[m.chat][d]
                totalGeneral += lista.length
                texto += `│ 📅 ${d.toUpperCase()}: ${lista.length} personas\n`
                if(lista.length > 0) texto += `│ ${lista.map((v,i) => `${i+1}. @${v.split('@')[0]}`).join(' | ')}\n│\n`
            })
            texto += `│ *TOTAL GENERAL:* ${totalGeneral} personas\n╰─────────────────────────────╯`
            await conn.reply(m.chat, texto, m, { mentions: Object.values(dbSorteos[m.chat]).flat() })
            return
        }

        // ====== COMANDO:.limpiar [dia] ======
        if (command === 'limpiar') {
            let target = args[0]?.toLowerCase()
            await conn.sendMessage(m.chat, { react: { text: '🗑️', key: m.key } })
            if (target === 'todo') {
                diasValidos.forEach(d => dbSorteos[m.chat][d] = [])
                return m.reply(`*🍓 BOT FRESITA*\n\n✅ Se ha limpiado *TODA LA SEMANA*`)
            }
            if (!diasValidos.includes(target)) return m.reply(`❌ Usa:.limpiar [lunes-domingo] o.limpiar todo`)
            dbSorteos[m.chat][target] = []
            return m.reply(`*🍓 BOT FRESITA*\n\n✅ Se ha limpiado la lista del día *${target}*`)
        }

        // ====== COMANDOS:.lunes a.domingo SOLO RESPONDIENDO ======
        if (diasValidos.includes(command)) {
            let dia = command
            let lista = dbSorteos[m.chat][dia]

            // REGLA NUEVA: SOLO SE PUEDE SI RESPONDES
            if (!m.quoted) {
                return m.reply(`*🍓 BOT FRESITA*\n\n❌ ERROR\n\nTienes que *responder al mensaje* del usuario que quieres anotar.\n\nEjemplo correcto: Responde al mensaje de Pepito y pon.${dia}\n\n❌.${dia} @Pepito ← Esto ya no funciona`)
            }

            let jid = m.quoted.sender
            let yaEstaba = lista.includes(jid)

            if (!yaEstaba) lista.push(jid)
            await conn.sendMessage(m.chat, { react: { text: yaEstaba? '⚠️' : '✅', key: m.key } })

            let txt = `*🍓 BOT FRESITA*

╭─「 📅 ACTUALIZADO ${dia.toUpperCase()} 」─╮
│
${yaEstaba? `│ *AVISO:* @${jid.split('@')[0]} ya estaba anotado\n│` : `│ *NUEVO:* @${jid.split('@')[0]} fue agregado\n│`}
│ *LISTA ACTUAL:* ${lista.length} personas
${lista.map((v,i) => `│ ${i+1}. @${v.split('@')[0]}`).join('\n')}
│
╰───────────────────────────────╯`
            await conn.reply(m.chat, txt, m, { mentions: lista })
            return
        }

    } catch (e) {
        await m.reply(`❌ ERROR: ${e.message}`)
    }
}

handler.help = ['lunes','ver','tabla','limpiar']
handler.tags = ['sorteo']
handler.command = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo','ver','tabla','limpiar']
handler.admin = true
export default handler