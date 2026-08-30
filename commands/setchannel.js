const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { setAnnounceChannel } = require('../utils/channelStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('تحديد الروم اللي هتنشر فيه إشعارات الروايات والفصول الجديدة')
        .addChannelOption(opt =>
            opt.setName('روم')
                .setDescription('الروم المطلوب')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const channel = interaction.options.getChannel('روم');
        setAnnounceChannel(interaction.guildId, channel.id);
        await interaction.reply({
            content: `✅ تم ضبط روم الإشعارات على ${channel}. كل رواية/فصل جديد هيتنشر هنا تلقائيًا.`,
            ephemeral: true,
        });
    },
};
