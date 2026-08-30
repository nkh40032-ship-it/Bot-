const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getStats } = require('../utils/siteApi');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('عرض إحصائيات موقع الروايات'),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            const s = await getStats();
            const embed = new EmbedBuilder()
                .setColor(0xC62828)
                .setTitle(`📊 إحصائيات ${s.site}`)
                .addFields(
                    { name: '📚 الروايات', value: String(s.novels), inline: true },
                    { name: '📄 الفصول', value: String(s.chapters), inline: true },
                    { name: '👤 الأعضاء', value: String(s.members), inline: true }
                )
                .setURL(s.url)
                .setFooter({ text: 'Azora Novels' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            await interaction.editReply(`⚠️ حدث خطأ: ${err.message}`);
        }
    },
};
