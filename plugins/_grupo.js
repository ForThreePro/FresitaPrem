let handler = async (m, { conn, isAdmin, command }) => {
    if (!m.isGroup) return m.reply(`*🍓 BOT FRESITA*\n\n❌ Este comando solo funciona en grupos`)
    if (!isAdmin) return m.reply(`*🍓 BOT FRESITA*\n\n❌ Solo admins pueden usar este comando`)

    try {
        if(command === 'abrir' || command === 'open'){
            await conn.groupSettingUpdate(m.chat, 'not_announcement')
            await conn.sendMessage(m.chat, { react: { text: '🍓', key: m.key } })

            let txt = `*🍓 BOT FRESITA*

╭─「 ⚡ GRUPO LIBERADO 」─╮
│
│ *ESTADO:* 🔓 Abierto
│ *VIBRA:* Tierna
│ *ADMIN:* @${m.sender.split('@')[0]}
│
│ *Todos pueden hablar ahora*
╰────────────────────────╯

> *"¡Fresita al 100!"*`

            await conn.reply(m.chat, txt, m, { mentions: [m.sender] })

        } else if(command === 'cerrar' || command === 'close'){
            await conn.groupSettingUpdate(m.chat, 'announcement')
            await conn.sendMessage(m.chat, { react: { text: '🔒', key: m.key } })

            let txt = `*🍓 BOT FRESITA*

╭─「 🔒 GRUPO BLOQUEADO 」─╮
│
│ *ESTADO:* 🔒 Cerrado
│ *VIBRA:* Solo Admins
│ *ADMIN:* @${m.sender.split('@')[0]}
│
│ *Solo admins pueden hablar*
╰─────────────────────────╯

> *"Fresita en reposo"*`

            await conn.reply(m.chat, txt, m, { mentions: [m.sender] })
        }
    } catch (e) {
        if(e.message.includes('not-admin')) {
            return m.reply(`*🍓 BOT FRESITA*\n\n❌ Necesito ser admin para hacer eso`)
        }
        await m.reply(`❌ ERROR: ${e.message}`)
    }
}

handler.help = ['abrir', 'cerrar']
handler.tags = ['group']
handler.command = ['abrir', 'cerrar', 'open', 'close']
handler.admin = true
export default handler