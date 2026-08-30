const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { searchNovel } = require('../utils/siteApi');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('novel')
        .setDescription('البحث عن رواية على الموقع')
        .addStringOption(opt =>
            opt.setName('اسم')
                .setDescription('اسم الرواية أو جزء منه')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const query = interaction.options.getString('اسم');

        try {
            const results = await searchNovel(query);
            if (!results.length) {
                return interaction.editReply(`لم يتم العثور على أي رواية باسم "${query}".`);
            }

            const n = results[0];
            const statusMap = { ongoing: '🟢 مستمرة', completed: '🔴 مكتملة', hiatus: '⏸️ متوقفة مؤقتًا', upcoming: '🔜 قريبًا' };

            const embed = new EmbedBuilder()
                .setColor(0xC62828)
                .setTitle(n.title)
                .setURL(n.url)
                .setDescription(n.excerpt || 'لا يوجد وصف')
                .addFields(
                    { name: 'الحالة', value: statusMap[n.status] || n.status || 'غير محدد', inline: true },
                    { name: 'عدد الفصول', value: String(n.chapters_count ?? 0), inline: true },
                    { name: 'التقييم', value: n.rating ? `⭐ ${n.rating}/10` : 'لا يوجد بعد', inline: true }
                )
                .setFooter({ text: 'Azora Novels' });

            if (n.author) embed.addFields({ name: 'المؤلف', value: n.author, inline: true });
            if (n.cover) embed.setThumbnail(n.cover);

            if (results.length > 1) {
                embed.addFields({
                    name: 'نتائج أخرى',
                    value: results.slice(1).map(r => `• [${r.title}](${r.url})`).join('\n'),
                });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            await interaction.editReply(`⚠️ حدث خطأ: ${err.message}`);
        }
    },
};
