let handler = async (m, { conn, command, usedPrefix, isAdmin }) => {
    if (!isAdmin) return m.reply('~*~*~*~*~*~*~*~*~*~\n ACCESO DENEGADO\n~*~*~*~*~*~*~*~*~*~')

    global.db.data.sorteos = global.db.data.sorteos || {}
    let sorteos = global.db.data.sorteos
    let chatId = m.chat

    const dias = ['lunes','martes','miercoles','jueves','viernes','sabado']
    const emojis = {lunes:'🌙', martes:'🌌', miercoles:'✨', jueves:'🌠', viernes:'💫', sabado:'👑'}
    const aurora = '~*~*~*~*~*~*~*~*~*~'
    let pp = await conn.profilePictureUrl(chatId, 'image').catch(_ => 'https://i.imgur.com/8K2JhZQ.jpg')

    let dia = command.toLowerCase()
    if (!dias.includes(dia)) return

    let asignados = sorteos[chatId][dia]
    if (!asignados ||!asignados.length) return m.reply(`${aurora}\n CIELO VACÍO\nUsa: ${usedPrefix}set${dia} @user\n${aurora}`)

    const crearLista = (arr) => arr.map((u, i) => `✨ ${i+1}. @${u.split('@')[0]}`).join('\n')
    let list = crearLista(asignados)
    let msg = `${aurora}
    AURORA ${dia.toUpperCase()}
${aurora}

🌌 Estado: BRILLANDO
${emojis[dia]} Hoy te toca ${dia.toUpperCase()} ${emojis[dia]}

✧ CONSTELACIÓN ✧
${list}

~* Tareas estelares *~
1. Realizar sorteo
2. Pedir reacciones
3. Compartir evidencia

Que tu luz ilumine el grupo ✨`
    await conn.sendMessage(m.chat, { image: { url: pp }, caption: msg, mentions: asignados })
}

handler.command = /^(lunes|martes|miercoles|jueves|viernes|sabado)$/i
handler.group = true
handler.admin = true
export default handler