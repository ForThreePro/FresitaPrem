let handler = async (m, { conn }) => {
    global.db.data.sorteos = global.db.data.sorteos || {}
    let sorteos = global.db.data.sorteos
    let chatId = m.chat

    const dias = ['lunes','martes','miercoles','jueves','viernes','sabado']
    const emojis = {lunes:'🌙', martes:'🌌', miercoles:'✨', jueves:'🌠', viernes:'💫', sabado:'👑'}
    const aurora = '~*~*~*~*~*~*~*~*~*~'
    let pp = await conn.profilePictureUrl(chatId, 'image').catch(_ => 'https://i.imgur.com/8K2JhZQ.jpg')

    let diasConData = dias.filter(d => Array.isArray(sorteos[chatId][d]) && sorteos[chatId][d].length > 0)
    if (diasConData.length === 0) return m.reply(`${aurora}\n CIELO NOCTURNO VACÍO\n${aurora}`)

    let txt = `${aurora}
   CIELO SEMANAL
${aurora}\n`

    let todos = []
    for(let d of dias){
        if(!Array.isArray(sorteos[chatId][d]) || sorteos[chatId][d].length === 0) continue
        txt += `\n🌌 ${emojis[d]} ${d.toUpperCase()}\n`
        txt += sorteos[chatId][d].map((u, i) => `✨ ${i+1}. @${u.split('@')[0]}`).join('\n') + '\n'
        todos.push(...sorteos[chatId][d])
    }
    txt += `\n~* que las auroras los guíen *~`
    await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: [...new Set(todos)] })
}

handler.command = /^ver1$/i
handler.group = true
export default handler