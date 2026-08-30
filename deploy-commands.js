require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !CLIENT_ID) {
    console.error('❌ لازم تضبط DISCORD_TOKEN و CLIENT_ID في .env قبل تشغيل هذا السكربت');
    process.exit(1);
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
    try {
        console.log(`⏳ جاري تسجيل ${commands.length} أمر...`);

        const route = GUILD_ID
            ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID) // فوري — لسيرفر تجريبي واحد
            : Routes.applicationCommands(CLIENT_ID);               // عام — لكل السيرفرات (حتى ساعة للظهور)

        await rest.put(route, { body: commands });

        console.log(`✅ تم تسجيل ${commands.length} أمر بنجاح${GUILD_ID ? ' (على السيرفر التجريبي)' : ' (بشكل عام)'}`);
    } catch (err) {
        console.error('❌ فشل تسجيل الأوامر:', err);
    }
})();
