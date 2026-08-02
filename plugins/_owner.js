let handler = async (m, { conn }) => {
    let vcard = `BEGIN:VCARD
VERSION:3.0
N:;Fernanda;;;
FN:Fernanda
ORG:𝐅𝐑𝐄𝐒𝐈𝐓𝐀 𝐁𝐎𝐓
TEL;type=CELL;type=VOICE;waid=56927308426:+56 9 2730 8426
END:VCARD`

    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: 'Fernanda - FRESITA BOT',
            contacts: [{ vcard }]
        }
    }, { quoted: m })

    await conn.reply(m.chat, `🍓 *𝐁𝐎𝐓 𝐅𝐑𝐄𝐒𝐈𝐓𝐀*

╭─「 👑 𝐂𝐑𝐄𝐀𝐃𝐎𝐑𝐀 」─╮
│
│ *𝐍𝐎𝐌𝐁𝐑𝐄:* 𝐅𝐞𝐫𝐧𝐚𝐧𝐝𝐚
│ *𝐍𝐔𝐌𝐄𝐑𝐎:* +56 9 2730 8426
│ *𝐁𝐎𝐓:* 𝐅𝐑𝐄𝐒𝐈𝐓𝐀 𝐁𝐎𝐓
│
╰─────────────────╯

> 𝐄𝐬𝐜𝐫𝐢𝐛𝐞𝐦𝐞 𝐝𝐮𝐥𝐜𝐞 𝐧𝐨 𝐦𝐮𝐞𝐫𝐝𝐨 🍓💕`, m)
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner']
export default handler