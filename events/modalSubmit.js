const { Events, ChannelType } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;
        if (interaction.customId !== 'maintenance_modal') return;

        await interaction.deferReply({ ephemeral: true });

        try {
            // Charger les données temporaires
            const tempFilePath = `./data/temp_maintenance_${interaction.user.id}.json`;
            if (!fs.existsSync(tempFilePath)) {
                return interaction.editReply({
                    content: '❌ Données de maintenance expirées. Veuillez relancer la commande.'
                });
            }

            const tempData = JSON.parse(fs.readFileSync(tempFilePath, 'utf8'));
            const blockedRole = interaction.guild.roles.cache.get(tempData.blockedRoleId);

            if (!blockedRole) {
                return interaction.editReply({
                    content: '❌ Le rôle spécifié n\'existe plus.'
                });
            }

            // Récupérer les données du modal
            const announcementChannelName = interaction.fields.getTextInputValue('announcement_channel_name');
            const announcementMessage = interaction.fields.getTextInputValue('announcement_message');
            const chatChannelName = interaction.fields.getTextInputValue('chat_channel_name');
            const dmMessage = interaction.fields.getTextInputValue('dm_message');

            const tempChannels = [];

            // Créer le salon annonce si demandé
            let announcementChannel = null;
            if (announcementChannelName.trim()) {
                announcementChannel = await interaction.guild.channels.create({
                    name: announcementChannelName,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            allow: ['ViewChannel', 'ReadMessageHistory'],
                            deny: ['SendMessages']
                        },
                        {
                            id: blockedRole.id,
                            allow: ['ViewChannel', 'ReadMessageHistory'],
                            deny: ['SendMessages']
                        }
                    ]
                });
                tempChannels.push(announcementChannel.id);

                // Envoyer le message d'initialisation si demandé
                if (announcementMessage.trim()) {
                    await announcementChannel.send(announcementMessage);
                }
            }

            // Créer le salon chat si demandé
            let chatChannel = null;
            if (chatChannelName.trim()) {
                chatChannel = await interaction.guild.channels.create({
                    name: chatChannelName,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                        },
                        {
                            id: blockedRole.id,
                            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                        }
                    ]
                });
                tempChannels.push(chatChannel.id);
            }

            // Ajouter le rôle à tous les membres
            let roleAddedCount = 0;
            for (const [, member] of interaction.guild.members.cache) {
                try {
                    if (!member.roles.cache.has(blockedRole.id)) {
                        await member.roles.add(blockedRole);
                        roleAddedCount++;
                    }
                } catch (error) {
                    console.error(`Erreur lors de l'ajout du rôle pour ${member.user.tag}:`, error);
                }
            }

            // Appliquer les permissions sur tous les salons existants
            let channelsUpdated = 0;
            for (const [, channel] of interaction.guild.channels.cache) {
                try {
                    // Ne pas modifier les salons temporaires créés
                    if (tempChannels.includes(channel.id)) continue;

                    await channel.permissionOverwrites.create(blockedRole, {
                        ViewChannel: false
                    });
                    channelsUpdated++;
                } catch (error) {
                    console.error(`Erreur lors de la modification des permissions pour ${channel.name}:`, error);
                }
            }

            // Envoyer les MP si demandé
            let dmsSent = 0;
            if (dmMessage.trim()) {
                for (const [, member] of interaction.guild.members.cache) {
                    try {
                        if (!member.user.bot) {
                            await member.send(dmMessage);
                            dmsSent++;
                        }
                    } catch (error) {
                        console.error(`Erreur lors de l'envoi du MP à ${member.user.tag}:`, error);
                    }
                }
            }

            // Sauvegarder les données de maintenance
            let maintenanceData = {};
            if (fs.existsSync('./data/maintenance.json')) {
                maintenanceData = JSON.parse(fs.readFileSync('./data/maintenance.json', 'utf8'));
            }

            maintenanceData[interaction.guild.id] = {
                active: true,
                blockedRoleId: blockedRole.id,
                tempChannels: tempChannels,
                startedBy: interaction.user.id,
                startedAt: new Date().toISOString()
            };

            fs.writeFileSync('./data/maintenance.json', JSON.stringify(maintenanceData, null, 2));

            // Supprimer le fichier temporaire
            fs.unlinkSync(tempFilePath);

            let response = `✅ Maintenance activée avec succès!\n`;
            response += `📊 Rôle ${blockedRole.name} ajouté à ${roleAddedCount} membres\n`;
            response += `📊 Permissions appliquées à ${channelsUpdated} salons\n`;
            
            if (tempChannels.length > 0) {
                response += `📊 ${tempChannels.length} salon(s) temporaire(s) créé(s)\n`;
            }
            
            if (dmsSent > 0) {
                response += `📊 ${dmsSent} MP envoyé(s)`;
            }

            await interaction.editReply({ content: response });

        } catch (error) {
            console.error('Erreur lors de l\'activation de la maintenance:', error);
            await interaction.editReply({
                content: `❌ Erreur lors de l\'activation de la maintenance: ${error.message}`
            });
        }
    },
};
