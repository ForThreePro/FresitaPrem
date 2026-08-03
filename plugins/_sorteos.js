let handler = async (m, { conn, command, usedPrefix, isAdmin }) => {

    global.db.data.sorteos = global.db.data.sorteos || {}
    let sorteos = global.db.data.sorteos
    let chatId = m.chat
    let metadata = m.isGroup? await conn.groupMetadata(m.chat) : {}
    let participants = metadata.participants || []

    const dias = ['lunes','martes','miercoles','jueves','viernes','sabado']
    const emojis = {lunes:'🌙', martes:'🌌', miercoles:'✨', jueves:'🌠', viernes:'💫', sabado:'👑'}
    const aurora = '~*~*~*~*~*~*~*~*~*~'

    let dia = command.replace('set','').replace('borrar','').toLowerCase()
    sorteos[chatId] = sorteos[chatId] || {}

    let pp = await conn.profilePictureUrl(chatId, 'image').catch(_ => 'https://i.imgur.com/8K2JhZQ.jpg')

    // ===== DETECTOR NIVEL DIOS V2 =====
    function getTargetUsers() {
        let targets = new Set()

        // PRIORIDAD 1: MENCIONES OFICIALES
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            m.mentionedJid.forEach(j => targets.add(j))
        }

        // PRIORIDAD 2: ESCANEAR @NUMEROS EN TEXTO
        let textoCompleto = (m.text || '') + ' ' + (m.quoted?.text || '')
        let matches = textoCompleto.match(/@(\d{8,})/g)
        if (matches) {
            matches.forEach(match => {
                let num = match.replace(/[^0-9]/g, '')
                if (num.length > 8) targets.add(num + '@s.whatsapp.net')
            })
        }

        // PRIORIDAD 3: RESPONDER - FORZADO NIVEL BOSS
        if (m.quoted) {
            let jid = m.quoted.sender || m.quoted.key?.participant || m.quoted.key?.remoteJid
            if (jid) targets.add(jid)
        }

        // PRIORIDAD 4: POR NOMBRE
        let args = (m.text || '').split(' ').slice(1)
        args.forEach(arg => {
            let name = arg.toLowerCase().replace('@','')
            if (name.length > 2) {
                let found = participants.find(p => conn.getName(p.id).toLowerCase().includes(name))
                if (found) targets.add(found.id)
            }
        })

        // FILTRO: SOLO DEL GRUPO
        let groupJids = participants.map(p => p.id)
        return [...targets].filter(t => groupJids.includes(t) || t.endsWith('@s.whatsapp.net'))
    }

    const crearLista = (arr) => arr.map((u, i) => {
        let num = u.split('@')[0].replace(/[^0-9]/g, '')
        return `✨ ${i+1}. @${num}`
    }).join('\n')

    // ===== 1. ASIGNAR =====
    if (command.startsWith('set')) {
        if (!isAdmin) return m.reply(`${aurora}\n ACCESO DENEGADO\n${aurora}`)
        if (!dias.includes(dia)) return m.reply(`${aurora}\n DÍA INVÁLIDO\n${aurora}`)

        let mentioned = getTargetUsers()
        if (mentioned.length === 0) return m.reply(`${aurora}\n FALTA MENCIONAR\nEj: ${usedPrefix}set${dia} @user1 @user2\nO escribe @numero\nO responde + ${usedPrefix}set${dia}\n${aurora}`)

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

        let list = crearLista(asignados)
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
            txt += crearLista(sorteos[chatId][d]) + '\n'
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