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

    // Obtener foto del grupo
    let pp = await conn.profilePictureUrl(chatId, 'image').catch(_ => 'https://i.imgur.com/8K2JhZQ.jpg')

    // ===== FUNCION PARA DETECTAR USUARIOS FORZADA =====
    function getTargetUsers() {
        let targets = []

        // PRIORIDAD 1: MENCION TOCANDO @
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            targets = m.mentionedJid
        }
        // PRIORIDAD 2: RESPONDER MENSAJE
        else if (m.quoted) {
            targets = [m.quoted.sender]
            // Anti-bug Baileys
            if (targets[0] === m.sender && m.quoted.text) {
                let match = m.quoted.text.match(/@(\d{8,})/)
                if (match) targets = [match[1] + '@s.whatsapp.net']
            }
        }
        // PRIORIDAD 3: ESCRIBIR NOMBRE/NUMERO
        else if (m.text) {
            let args = m.text.split(' ').slice(1) // quita el comando
            for (let arg of args) {
                let name = arg.toLowerCase().replace('@','')
                // Busca por nombre
                let found = participants.find(p => conn.getName(p.id).toLowerCase().includes(name))
                if (found) targets.push(found.id)
                else {
                    // Busca por numero
                    let num = arg.replace(/[^0-9]/g, '')
                    if (num.length > 8) targets.push(num + '@s.whatsapp.net')
                }
            }
        }
        return [...new Set(targets)] // quita duplicados
    }

    // ===== 1. ASIGNAR.setlunes @user =====
    if (command.startsWith('set')) {
        if (!isAdmin) return m.reply(`${aurora}\n ACCESO DENEGADO\n${aurora}`)
        if (!dias.includes(dia)) return m.reply(`${aurora}\n DÍA INVÁLIDO\n${aurora}`)

        let mentioned = getTargetUsers() // AHORA USA LA FUNCION FORZADA
        if (mentioned.length === 0) return m.reply(`${aurora}\n FALTA MENCIONAR\nEj: ${usedPrefix}set${dia} @user1 @user2\nO responde + ${usedPrefix}set${dia}\n${aurora}`)

        sorteos[chatId][dia] = [...new Set(mentioned)]

        let list = sorteos[chatId][dia].map((u, i) => `✨ ${i+1}. @${u.split('@')[0]}`).join('\n')
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

    // ===== 2. BORRAR.borrarlunes =====
    if (command.startsWith('borrar')) {
        if (!isAdmin) return m.reply(`${aurora}\n ACCESO DENEGADO\n${aurora}`)
        if (!sorteos[chatId][dia]) return m.reply(`${aurora}\n NO HAY LUZ EN ${dia.toUpperCase()}\n${aurora}`)
        delete sorteos[chatId][dia]
        return m.reply(`${aurora}\n AURORA APAGADA\nSe borró ${dia.toUpperCase()}\n${aurora}`)
    }

    // ===== 3. RECORDATORIO.lunes =====
    if (dias.includes(command.toLowerCase())) {
        if (!isAdmin) return m.reply(`${aurora}\n ACCESO DENEGADO\n${aurora}`)
        let asignados = sorteos[chatId][command.toLowerCase()]
        if (!asignados ||!asignados.length) return m.reply(`${aurora}\n CIELO VACÍO\nUsa: ${usedPrefix}set${command} @user\n${aurora}`)

        let list = asignados.map((u, i) => `✨ ${i+1}. @${u.split('@')[0]}`).join('\n')

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

    // ===== 4. VER TODO.ver =====
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
            sorteos[chatId][d].forEach((u, i) => {
                txt += `✨ ${i+1}. @${u.split('@')[0]}\n`
                todos.push(u)
            })
        }
        txt += `\n~* que las auroras los guíen *~`
        await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: [...new Set(todos)] })
        return
    }
}

handler.help = ['setlunes @tag : Asigna encargados del lunes', 'setmartes @tag : Asigna encargados del martes', 'setmiercoles @tag : Asigna encargados del miercoles', 'setjueves @tag : Asigna encargados del jueves', 'setviernes @tag : Asigna encargados del viernes', 'setsabado @tag : Asigna encargados del sabado', 'lunes : Avisa y etiqueta a los de turno del lunes', 'martes : Avisa y etiqueta a los de turno del martes', 'miercoles : Avisa y etiqueta a los de turno del miercoles', 'jueves : Avisa y etiqueta a los de turno del jueves', 'viernes : Avisa y etiqueta a los de turno del viernes', 'sabado : Avisa y etiqueta a los de turno del sabado', 'borrarlunes : Borra asignación del lunes', 'borrarmartes : Borra asignación del martes', 'borrarmiercoles : Borra asignación del miercoles', 'borrarjueves : Borra asignación del jueves', 'borrarviernes : Borra asignación del viernes', 'borrarsabado : Borra asignación del sabado','ver1 : Muestra el cronograma semanal completo'
]
handler.tags = ['sorteos']
handler.command = /^(setlunes|setmartes|setmiercoles|setjueves|setviernes|setsabado|borrarlunes|borrarmartes|borrarmiercoles|borrarjueves|borrarviernes|borrarsabado|lunes|martes|miercoles|jueves|viernes|sabado|ver1)$/i
handler.group = true
handler.admin = true
export default handler