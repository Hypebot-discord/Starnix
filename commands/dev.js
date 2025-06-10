const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription('Commandes de développement')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ping')
                .setDescription('Ping du bot'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('avatar')
                .setDescription('Obtenir l\'avatar d\'un membre')
                .addUserOption(option =>
                    option
                        .setName('membre')
                        .setDescription('Le membre dont vous voulez l\'avatar')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('icone')
                .setDescription('Obtenir l\'icône du serveur'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('userinfo')
                .setDescription('Informations sur un utilisateur')
                .addUserOption(option =>
                    option
                        .setName('membre')
                        .setDescription('Le membre dont vous voulez les infos')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('serverinfo')
                .setDescription('Informations sur le serveur')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'ping':
                const ping = interaction.client.ws.ping;
                await interaction.reply({
                    content: `🏓 Pong ! Latence: ${ping}ms`,
                    ephemeral: true
                });
                break;

            case 'avatar':
                const user = interaction.options.getUser('membre');
                const embed = new EmbedBuilder()
                    .setTitle(`Avatar de ${user.tag}`)
                    .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setColor('#0099ff');
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;

            case 'icone':
                const guild = interaction.guild;
                if (!guild.iconURL()) {
                    return interaction.reply({
                        content: '❌ Ce serveur n\'a pas d\'icône.',
                        ephemeral: true
                    });
                }
                
                const iconEmbed = new EmbedBuilder()
                    .setTitle(`Icône de ${guild.name}`)
                    .setImage(guild.iconURL({ dynamic: true, size: 1024 }))
                    .setColor('#0099ff');
                
                await interaction.reply({ embeds: [iconEmbed], ephemeral: true });
                break;

            case 'userinfo':
                const member = interaction.options.getMember('membre');
                const userInfoEmbed = new EmbedBuilder()
                    .setTitle(`Informations sur ${member.user.tag}`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: 'ID', value: member.user.id, inline: true },
                        { name: 'Compte créé le', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: true },
                        { name: 'A rejoint le serveur le', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
                        { name: 'Rôles', value: member.roles.cache.map(role => role.toString()).join(' ') || 'Aucun rôle', inline: false }
                    )
                    .setColor(member.displayHexColor);
                
                await interaction.reply({ embeds: [userInfoEmbed], ephemeral: true });
                break;

            case 'serverinfo':
                const serverGuild = interaction.guild;
                const serverInfoEmbed = new EmbedBuilder()
                    .setTitle(`Informations sur ${serverGuild.name}`)
                    .setThumbnail(serverGuild.iconURL({ dynamic: true }))
                    .addFields(
                        { name: 'ID', value: serverGuild.id, inline: true },
                        { name: 'Propriétaire', value: `<@${serverGuild.ownerId}>`, inline: true },
                        { name: 'Créé le', value: `<t:${Math.floor(serverGuild.createdTimestamp / 1000)}:F>`, inline: true },
                        { name: 'Membres', value: serverGuild.memberCount.toString(), inline: true },
                        { name: 'Rôles', value: serverGuild.roles.cache.size.toString(), inline: true },
                        { name: 'Salons', value: serverGuild.channels.cache.size.toString(), inline: true }
                    )
                    .setColor('#0099ff');
                
                await interaction.reply({ embeds: [serverInfoEmbed], ephemeral: true });
                break;
        }
    },
};
