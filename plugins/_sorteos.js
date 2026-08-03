let handler = async (m, { conn, command, usedPrefix, isAdmin }) => {

    global.db.data.sorteos = global.db.data.sorteos || {}
    let sorteos = global.db.data.sorteos
    let chatId = m.chat
    let participants = m.isGroup? (await conn.groupMetadata(m.chat)).participants : []

    const dias = ['lunes','martes','miercoles','jueves','viernes','sabado']
    const emojis = {lunes:'🌙', martes:'🌌', miercoles:'✨', jueves:'🌠', viernes:'💫', sabado:'👑'}
    const aurora = '~*~*~*~*~*~*~*~*~*~'

    let dia = command.replace('set','').replace('borrar','').toLowerCase()
    sorteos[chatId] = sorteos[chatId] || {}

    let pp = await conn.profilePictureUrl(chatId, 'image').catch(_ => 'https://i.imgur.com/8K2JhZQ.jpg')

    function getTargetUsers() {
        let targets = []
        if (m.mentionedJid && m.mentionedJid.length > 0) targets = m.mentionedJid
        else if (m.quoted) {
            targets = [m.quoted.sender]
            if (targets[0] === m.sender && m.quoted.text) {
                let match = m.quoted.text.match(/@(\d{8,})/)
                if (match) targets = [match[1] + '@s.whatsapp.net']
            }
        }
        else if (m.text) {
            let args = m.text.split(' ').slice(1)
            for (let arg of args) {
                let name = arg.toLowerCase().replace('@','')
                let found = participants.find(p => conn.getName(p.id).toLowerCase().includes(name))
                if (found) targets.push(found.id)
                else {
                    let num = arg.replace(/[^0-9]/g, '')
                    if (num.length > 8) targets.push(num + '@s.whatsapp.net')
                }
            }
        }
        return [...new Set(targets)]
    }

    // NUEVA FUNCION: LIMPIA EL NUMERO Y PONE NOMBRE SI SE PUEDE
    const crearLista = async (arr) => {
        let lista = []
        for(let i = 0; i < arr.length; i++) {
            let jid = arr[i]
            let num = jid.split('@')[0].replace(/[^0-9]/g, '') // quita + y espacios
            let name = await conn.getName(jid).catch(() => num) // intenta agarrar el nombre
            lista.push(`✨ ${i+1}. @${num} ${name!== num? `(${name})` : ''}`) // @numero (Nombre)
        }
        return lista.join('\n')
    }

    // ===== 1. ASIGNAR.setlunes =====
    if (command.startsWith('set')) {
        if (!isAdmin) return m.reply(`${aurora}\n ACCESO DENEGADO\n${aurora}`)
        if (!dias.includes(dia)) return m.reply(`${aurora}\n DÍA INVÁLIDO\n${aurora}`)

        let mentioned = getTargetUsers()
        if (mentioned.length === 0) return m.reply(`${aurora}\n FALTA MENCIONAR\nEj: ${usedPrefix}set${dia} @user1 @user2\nO responde + ${usedPrefix}set${dia}\n${aurora}`)

        sorteos[chatId][dia] = mentioned

        let list = await crearLista(mentioned) // AHORA ES AWAIT
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
        return
    }

    // ===== 2. BORRAR =====
    if (command.startsWith('borrar')) {
        if (!isAdmin) return m.reply(`${aurora}\n ACCESO DENEGADO\n${aurora}`)
        if (!sorteos[chatId][dia]) return m.reply(`${aurora}\n NO HAY LUZ EN ${dia.toUpperCase()}\n${aurora}`)
        delete sorteos[chatId][dia]
        return m.reply(`${aurora}\n AURORA APAGADA\nSe borró ${dia.toUpperCase()}\n${aurora}`)
    }

    // ===== 3. RECORDATORIO =====
    if (dias.includes(command.toLowerCase())) {
        if (!isAdmin) return m.reply(`${aurora}\n ACCESO DENEGADO\n${aurora}`)
        let asignados = sorteos[chatId][command.toLowerCase()]
        if (!asignados ||!asignados.length) return m.reply(`${aurora}\n CIELO VACÍO\nUsa: ${usedPrefix}set${command} @user\n${aurora}`)

        let list = await crearLista(asignados) // AWAIT AQUI TAMBIEN

        let msg = `${aurora}
    AURORA ${command.toUpperCase()}
${aurora}

🌌 Estado: BRILLANDO
${emojis[command]} Hoy te toca ${command.toUpperCase()} ${emojis[command]}

✧ CONSTELACIÓN ✧
${list}

~* Tareas estelares *~
1. Realizar sorteo
2. Pedir reacciones
3. Compartir evidencia

Que tu luz ilumine el grupo ✨`
        await conn.sendMessage(m.chat, { image: { url: pp }, caption: msg, mentions: asignados })
        return
    }

    // ===== 4. VER TODO =====
    if (command === 'ver1') {
        let diasConData = dias.filter(d => Array.isArray(sorteos[chatId][d]) && sorteos[chatId][d].length > 0)
        if (diasConData.length === 0) return m.reply(`${aurora}\n CIELO NOCTURNO VACÍO\n${aurora}`)

        let txt = `${aurora}
   CIELO SEMANAL
${aurora}\n`

        let todos = []
        for(let d of dias){
            if(!Array.isArray(sorteos[chatId][d]) || sorteos[chatId][d].length === 0) continue
            txt += `\n🌌 ${emojis[d]} ${d.toUpperCase()}\n`
            let listaDia = await crearLista(sorteos[chatId][d]) // AWAIT
            txt += listaDia + '\n'
            todos.push(...sorteos[chatId][d])
        }
        txt += `\n~* que las auroras los guíen *~`
        await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: [...new Set(todos)] })
        return
    }
}

handler.help = ['setlunes @tag', 'lunes', 'borrarlunes', 'ver1']
handler.tags = ['sorteos']
handler.command = /^(setlunes|setmartes|setmiercoles|setjueves|setviernes|setsabado|borrarlunes|borrarmartes|borrarmiercoles|borrarjueves|borrarviernes|borrarsabado|lunes|martes|miercoles|jueves|viernes|sabado|ver1)$/i
handler.group = true
handler.admin = true
export default handler