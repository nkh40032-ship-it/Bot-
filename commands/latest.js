const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLatestChapters } = require('../utils/siteApi');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('latest')
        .setDescription('عرض أحدث الفصول المنشورة على الموقع')
        .addIntegerOption(opt =>
            opt.setName('count')
                .setDescription('عدد الفصول (1-10)')
                .setMinValue(1)
                .setMaxValue(10)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const count = interaction.options.getInteger('count') || 5;

        try {
            const chapters = await getLatestChapters(count);
            if (!chapters.length) {
                return interaction.editReply('لا توجد فصول منشورة حتى الآن.');
            }

            const embed = new EmbedBuilder()
                .setColor(0xC62828)
                .setTitle('📖 أحدث الفصول')
                .setDescription(
                    chapters.map((ch, i) =>
                        `**${i + 1}.** [${ch.novel} — ${ch.chapter}](${ch.url})`
                    ).join('\n')
                )
                .setFooter({ text: 'Azora Novels' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            await interaction.editReply(`⚠️ حدث خطأ: ${err.message}`);
        }
    },
};
