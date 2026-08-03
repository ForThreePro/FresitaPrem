let handler = async (m, { conn, command, usedPrefix, isAdmin }) => {
    if (!isAdmin) return m.reply('~*~*~*~*~*~*~*~*~*~\n ACCESO DENEGADO\n~*~*~*~*~*~*~*~*~*~')

    global.db.data.sorteos = global.db.data.sorteos || {}
    let sorteos = global.db.data.sorteos
    let chatId = m.chat
    let metadata = m.isGroup? await conn.groupMetadata(m.chat) : {}
    let participants = metadata.participants || []
    sorteos[chatId] = sorteos[chatId] || {}

    const dias = ['lunes','martes','miercoles','jueves','viernes','sabado']
    const aurora = '~*~*~*~*~*~*~*~*~*~'
    let pp = await conn.profilePictureUrl(chatId, 'image').catch(_ => 'https://i.imgur.com/8K2JhZQ.jpg')

    let accion = command.startsWith('set')? 'set' : 'borrar'
    let dia = command.replace('set','').replace('borrar','').toLowerCase()

    if (!dias.includes(dia)) return

    function getTargetUsers() {
        let targets = new Set()
        if (m.mentionedJid && m.mentionedJid.length > 0) m.mentionedJid.forEach(j => targets.add(j))
        let textoCompleto = (m.text || '') + ' + (m.quoted?.text || '')
        let matches = textoCompleto.match(/@(\d{8,})/g)
        if (matches) matches.forEach(match => {
            let num = match.replace(/[^0-9]/g, '')
            if (num.length > 8) targets.add(num + '@s.whatsapp.net')
        })
        if (m.quoted) {
            let jid = m.quoted.sender || m.quoted.key?.participant || m.quoted.key?.remoteJid
            if (jid) targets.add(jid)
        }
        let args = (m.text || '').split(' ').slice(1)
        args.forEach(arg => {
            let name = arg.toLowerCase().replace('@','')
            if (name.length > 2) {
                let found = participants.find(p => conn.getName(p.id).toLowerCase().includes(name))
                if (found) targets.add(found.id)
            }
        })
        let groupJids = participants.map(p => p.id)
        return [...targets].filter(t => groupJids.includes(t) || t.endsWith('@s.whatsapp.net'))
    }

    const crearLista = (arr) => arr.map((u, i) => `✨ ${i+1}. @${u.split('@')[0]}`).join('\n')

    if (accion == 'set') {
        let mentioned = getTargetUsers()
        if (mentioned.length === 0) return m.reply(`${aurora}\n FALTA MENCIONAR\nEj: ${usedPrefix}set${dia} @user1\n${aurora}`)

        sorteos[chatId][dia] = mentioned
        let list = crearLista(mentioned)
        let msg = `${aurora}
    AURORA ${dia.toUpperCase()}
${aurora}

🌌 Estado: ASIGNADO
📅 Fecha: ${new Date().toLocaleDateString('es')}

✧ LUZ DEL NORTE ✧
${list}

~* brilla con tu sorteo *~
Usa *${usedPrefix}${dia}* para recordar`
        await conn.sendMessage(m.chat, { image: { url: pp }, caption: msg, mentions: mentioned })
    }

    if (accion == 'borrar') {
        if (!sorteos[chatId][dia]) return m.reply(`${aurora}\n NO HAY LUZ EN ${dia.toUpperCase()}\n${aurora}`)
        delete sorteos[chatId][dia]
        return m.reply(`${aurora}\n AURORA APAGADA\nSe borró ${dia.toUpperCase()}\n${aurora}`)
    }
}

handler.command = /^(setlunes|setmartes|setmiercoles|setjueves|setviernes|setsabado|borrarlunes|borrarmartes|borrarmiercoles|borrarjueves|borrarviernes|borrarsabado)$/i
handler.group = true
handler.admin = true
export default handler