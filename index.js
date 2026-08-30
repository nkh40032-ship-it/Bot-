require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const { getAllAnnounceChannels } = require('./utils/channelStore');

const { DISCORD_TOKEN, WEBHOOK_SECRET, PORT } = process.env;
if (!DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN غير مضبوط. راجع ملف .env.example');
    process.exit(1);
}

/* ============================================================
   1) عميل ديسكورد + تحميل الأوامر
   ============================================================ */
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(`خطأ في تنفيذ الأمر /${interaction.commandName}:`, err);
        const payload = { content: '⚠️ حدث خطأ غير متوقع أثناء تنفيذ الأمر.', ephemeral: true };
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(payload).catch(() => {});
        } else {
            await interaction.reply(payload).catch(() => {});
        }
    }
});

client.once('clientReady', () => {
    console.log(`✅ البوت شغال: ${client.user.tag}`);
});

client.login(DISCORD_TOKEN).catch((err) => {
    console.error('❌ فشل تسجيل دخول البوت لديسكورد:', err.message);
    console.error('تأكد إن DISCORD_TOKEN صحيح وإن البوت مضاف بشكل سليم.');
});

process.on('unhandledRejection', (err) => {
    console.error('⚠️ خطأ غير متوقع:', err);
});

/* ============================================================
   2) سيرفر Express — بيستقبل إشعارات الموقع (رواية/فصل جديد)
      ويبعتها كـ embed احترافي لروم الإعلانات في كل سيرفر متصل
   ============================================================ */
const app = express();
app.use(express.json());

// Health check — Railway بيستخدمه للتأكد إن الخدمة شغالة
app.get('/', (req, res) => res.send('Azora Discord Bot يعمل ✅'));

app.post('/notify', async (req, res) => {
    // تحقق من المفتاح السري عشان محدش غير موقعك يقدر يستخدم الإندبوينت ده
    if (WEBHOOK_SECRET) {
        const provided = req.headers['x-animax-secret'];
        if (provided !== WEBHOOK_SECRET) {
            return res.status(401).json({ error: 'unauthorized' });
        }
    }

    const data = req.body || {};
    const embed = buildEmbed(data);
    if (!embed) return res.status(400).json({ error: 'invalid_payload' });

    const channelIds = getAllAnnounceChannels();
    if (!channelIds.length) {
        console.warn('⚠️ لا يوجد روم إشعارات مضبوط بأي سيرفر (استخدم /setchannel أو ANNOUNCE_CHANNEL_ID)');
        return res.status(200).json({ warning: 'no_channel_configured' });
    }

    let sent = 0;
    for (const channelId of channelIds) {
        try {
            const channel = await client.channels.fetch(channelId);
            if (channel) {
                await channel.send({ embeds: [embed] });
                sent++;
            }
        } catch (err) {
            console.error(`تعذر الإرسال للروم ${channelId}:`, err.message);
        }
    }

    res.json({ ok: true, sent });
});

function buildEmbed(data) {
    if (data.event === 'new_novel') {
        const embed = new EmbedBuilder()
            .setColor(0x22C55E)
            .setTitle(`📚 رواية جديدة: ${data.title}`)
            .setURL(data.url)
            .setDescription(data.excerpt || '')
            .setFooter({ text: data.site || 'Azora Novels' })
            .setTimestamp();
        if (data.genre) embed.addFields({ name: 'التصنيف', value: data.genre, inline: true });
        if (data.author) embed.addFields({ name: 'المؤلف', value: data.author, inline: true });
        if (data.cover) embed.setImage(data.cover);
        return embed;
    }

    if (data.event === 'new_chapter') {
        const embed = new EmbedBuilder()
            .setColor(0xC62828)
            .setTitle(`📖 فصل جديد — ${data.novel}`)
            .setURL(data.url)
            .setDescription(`صدر الفصل **${data.number}**: ${data.chapter}`)
            .setFooter({ text: data.site || 'Azora Novels' })
            .setTimestamp();
        if (data.cover) embed.setThumbnail(data.cover);
        return embed;
    }

    return null;
}

const port = PORT || 3000;
app.listen(port, () => console.log(`🌐 سيرفر الإشعارات شغال على المنفذ ${port}`));
