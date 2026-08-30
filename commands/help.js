const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('عرض كل أوامر البوت المتاحة'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0xC62828)
            .setTitle('🤖 أوامر بوت Azora Novels')
            .setDescription(
                '`/latest [count]` — عرض أحدث الفصول المنشورة\n' +
                '`/novel <اسم>` — البحث عن رواية بالاسم\n' +
                '`/stats` — إحصائيات الموقع (روايات، فصول، أعضاء)\n' +
                '`/setchannel <روم>` — تحديد روم الإشعارات التلقائية (للمشرفين)\n' +
                '`/help` — عرض هذه القائمة'
            )
            .setFooter({ text: 'Azora Novels' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
