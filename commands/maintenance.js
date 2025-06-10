const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('maintenance')
        .setDescription('Gestion de la maintenance du serveur')
        .addSubcommand(subcommand =>
            subcommand
                .setName('on')
                .setDescription('Activer la maintenance')
                .addRoleOption(option =>
                    option
                        .setName('role_bloque')
                        .setDescription('Le rôle à utiliser pour bloquer l\'accès')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('off')
                .setDescription('Désactiver la maintenance')),

    async execute(interaction) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Vous devez être administrateur pour utiliser cette commande.',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'on') {
            const blockedRole = interaction.options.getRole('role_bloque');

            // Créer le modal pour les informations de maintenance
            const modal = new ModalBuilder()
                .setCustomId('maintenance_modal')
                .setTitle('Configuration de la maintenance');

            const announcementChannelInput = new TextInputBuilder()
                .setCustomId('announcement_channel_name')
                .setLabel('Nom du salon annonce provisoire')
                .setPlaceholder('Laissez vide si vous ne voulez pas de salon annonce')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const announcementMessageInput = new TextInputBuilder()
                .setCustomId('announcement_message')
                .setLabel('Message d\'initialisation du salon annonce')
                .setPlaceholder('Laissez vide si aucun message ne doit être envoyé')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            const chatChannelInput = new TextInputBuilder()
                .setCustomId('chat_channel_name')
                .setLabel('Nom du salon chat provisoire')
                .setPlaceholder('Laissez vide si vous ne voulez pas de salon chat')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const dmMessageInput = new TextInputBuilder()
                .setCustomId('dm_message')
                .setLabel('Message à envoyer en MP aux membres')
                .setPlaceholder('Laissez vide si aucun MP ne doit être envoyé')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(announcementChannelInput),
                new ActionRowBuilder().addComponents(announcementMessageInput),
                new ActionRowBuilder().addComponents(chatChannelInput),
                new ActionRowBuilder().addComponents(dmMessageInput)
            );

            // Stocker temporairement l'ID du rôle bloqué
            const tempData = { blockedRoleId: blockedRole.id, guildId: interaction.guild.id };
            fs.writeFileSync(`./data/temp_maintenance_${interaction.user.id}.json`, JSON.stringify(tempData));

            await interaction.showModal(modal);

        } else if (subcommand === 'off') {
            await interaction.deferReply({ ephemeral: true });

            try {
                // Charger les données de maintenance
                let maintenanceData = {};
                if (fs.existsSync('./data/maintenance.json')) {
                    maintenanceData = JSON.parse(fs.readFileSync('./data/maintenance.json', 'utf8'));
                }

                const guildData = maintenanceData[interaction.guild.id];
                if (!guildData || !guildData.active) {
                    return interaction.editReply({
                        content: '❌ Aucune maintenance n\'est actuellement active sur ce serveur.'
                    });
                }

                const blockedRole = interaction.guild.roles.cache.get(guildData.blockedRoleId);
                if (!blockedRole) {
                    return interaction.editReply({
                        content: '❌ Le rôle de maintenance n\'a pas été trouvé.'
                    });
                }

                // Supprimer les salons provisoires
                if (guildData.tempChannels) {
                    for (const channelId of guildData.tempChannels) {
                        try {
                            const channel = interaction.guild.channels.cache.get(channelId);
                            if (channel) {
                                await channel.delete();
                            }
                        } catch (error) {
                            console.error(`Erreur lors de la suppression du salon ${channelId}:`, error);
                        }
                    }
                }

                // Retirer le rôle de tous les membres
                let removedCount = 0;
                for (const [, member] of interaction.guild.members.cache) {
                    try {
                        if (member.roles.cache.has(blockedRole.id)) {
                            await member.roles.remove(blockedRole);
                            removedCount++;
                        }
                    } catch (error) {
                        console.error(`Erreur lors du retrait du rôle pour ${member.user.tag}:`, error);
                    }
                }

                // Retirer les permissions du rôle sur tous les salons
                let channelsUpdated = 0;
                for (const [, channel] of interaction.guild.channels.cache) {
                    try {
                        const overwrite = channel.permissionOverwrites.cache.get(blockedRole.id);
                        if (overwrite) {
                            await overwrite.delete();
                            channelsUpdated++;
                        }
                    } catch (error) {
                        console.error(`Erreur lors de la suppression des permissions pour ${channel.name}:`, error);
                    }
                }

                // Supprimer les données de maintenance
                delete maintenanceData[interaction.guild.id];
                fs.writeFileSync('./data/maintenance.json', JSON.stringify(maintenanceData, null, 2));

                await interaction.editReply({
                    content: `✅ Maintenance désactivée avec succès!\n📊 Rôle retiré de ${removedCount} membres\n📊 Permissions supprimées de ${channelsUpdated} salons`
                });

            } catch (error) {
                console.error('Erreur lors de la désactivation de la maintenance:', error);
                await interaction.editReply({
                    content: `❌ Erreur lors de la désactivation de la maintenance: ${error.message}`
                });
            }
        }
    },
};
