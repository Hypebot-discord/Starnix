const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const permissionsMap = {
    // Permissions générales
    'administrator': PermissionFlagsBits.Administrator,
    'manage_guild': PermissionFlagsBits.ManageGuild,
    'manage_roles': PermissionFlagsBits.ManageRoles,
    'manage_channels': PermissionFlagsBits.ManageChannels,
    'kick_members': PermissionFlagsBits.KickMembers,
    'ban_members': PermissionFlagsBits.BanMembers,
    'create_instant_invite': PermissionFlagsBits.CreateInstantInvite,
    'change_nickname': PermissionFlagsBits.ChangeNickname,
    'manage_nicknames': PermissionFlagsBits.ManageNicknames,
    'manage_emojis': PermissionFlagsBits.ManageEmojisAndStickers,
    'manage_webhooks': PermissionFlagsBits.ManageWebhooks,
    'view_audit_log': PermissionFlagsBits.ViewAuditLog,
    
    // Permissions d'écriture
    'view_channel': PermissionFlagsBits.ViewChannel,
    'send_messages': PermissionFlagsBits.SendMessages,
    'send_tts_messages': PermissionFlagsBits.SendTTSMessages,
    'manage_messages': PermissionFlagsBits.ManageMessages,
    'embed_links': PermissionFlagsBits.EmbedLinks,
    'attach_files': PermissionFlagsBits.AttachFiles,
    'read_message_history': PermissionFlagsBits.ReadMessageHistory,
    'mention_everyone': PermissionFlagsBits.MentionEveryone,
    'use_external_emojis': PermissionFlagsBits.UseExternalEmojis,
    'add_reactions': PermissionFlagsBits.AddReactions,
    'use_slash_commands': PermissionFlagsBits.UseApplicationCommands,
    'manage_threads': PermissionFlagsBits.ManageThreads,
    'create_public_threads': PermissionFlagsBits.CreatePublicThreads,
    'create_private_threads': PermissionFlagsBits.CreatePrivateThreads,
    'send_messages_in_threads': PermissionFlagsBits.SendMessagesInThreads,
    
    // Permissions vocales
    'connect': PermissionFlagsBits.Connect,
    'speak': PermissionFlagsBits.Speak,
    'mute_members': PermissionFlagsBits.MuteMembers,
    'deafen_members': PermissionFlagsBits.DeafenMembers,
    'move_members': PermissionFlagsBits.MoveMembers,
    'use_vad': PermissionFlagsBits.UseVAD,
    'priority_speaker': PermissionFlagsBits.PrioritySpeaker,
    'stream': PermissionFlagsBits.Stream,
    'use_embedded_activities': PermissionFlagsBits.UseEmbeddedActivities,
    'use_soundboard': PermissionFlagsBits.UseSoundboard
};

function createPermissionChoices(type) {
    const choices = [];
    for (const [name, value] of Object.entries(permissionsMap)) {
        if (type === 'general') {
            if (['administrator', 'manage_guild', 'manage_roles', 'manage_channels', 'kick_members', 'ban_members', 'create_instant_invite', 'change_nickname', 'manage_nicknames', 'manage_emojis', 'manage_webhooks', 'view_audit_log'].includes(name)) {
                choices.push({ name: name.replace(/_/g, ' '), value: name });
            }
        } else if (type === 'ecrit') {
            if (['view_channel', 'send_messages', 'send_tts_messages', 'manage_messages', 'embed_links', 'attach_files', 'read_message_history', 'mention_everyone', 'use_external_emojis', 'add_reactions', 'use_slash_commands', 'manage_threads', 'create_public_threads', 'create_private_threads', 'send_messages_in_threads'].includes(name)) {
                choices.push({ name: name.replace(/_/g, ' '), value: name });
            }
        } else if (type === 'vocal') {
            if (['connect', 'speak', 'mute_members', 'deafen_members', 'move_members', 'use_vad', 'priority_speaker', 'stream', 'use_embedded_activities', 'use_soundboard'].includes(name)) {
                choices.push({ name: name.replace(/_/g, ' '), value: name });
            }
        }
    }
    return choices.slice(0, 25); // Discord limite à 25 choix
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perms')
        .setDescription('Gestion des permissions')
        .addSubcommand(subcommand =>
            subcommand
                .setName('general')
                .setDescription('Permissions générales')
                .addStringOption(option =>
                    option
                        .setName('permission')
                        .setDescription('La permission à modifier')
                        .setRequired(true)
                        .setChoices(...createPermissionChoices('general')))
                .addStringOption(option =>
                    option
                        .setName('statut')
                        .setDescription('Autoriser ou refuser')
                        .setRequired(true)
                        .setChoices(
                            { name: 'Autoriser', value: 'allow' },
                            { name: 'Refuser', value: 'deny' },
                            { name: 'Neutre', value: 'neutral' }
                        ))
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Le rôle concerné (everyone si non précisé)')
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('salon1')
                        .setDescription('Premier salon (optionnel)')
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('salon2')
                        .setDescription('Deuxième salon (optionnel)')
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('salon3')
                        .setDescription('Troisième salon (optionnel)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ecrit')
                .setDescription('Permissions d\'écriture')
                .addStringOption(option =>
                    option
                        .setName('permission')
                        .setDescription('La permission à modifier')
                        .setRequired(true)
                        .setChoices(...createPermissionChoices('ecrit')))
                .addStringOption(option =>
                    option
                        .setName('statut')
                        .setDescription('Autoriser ou refuser')
                        .setRequired(true)
                        .setChoices(
                            { name: 'Autoriser', value: 'allow' },
                            { name: 'Refuser', value: 'deny' },
                            { name: 'Neutre', value: 'neutral' }
                        ))
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Le rôle concerné (everyone si non précisé)')
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('salon1')
                        .setDescription('Premier salon (optionnel)')
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('salon2')
                        .setDescription('Deuxième salon (optionnel)')
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('salon3')
                        .setDescription('Troisième salon (optionnel)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('vocal')
                .setDescription('Permissions vocales')
                .addStringOption(option =>
                    option
                        .setName('permission')
                        .setDescription('La permission à modifier')
                        .setRequired(true)
                        .setChoices(...createPermissionChoices('vocal')))
                .addStringOption(option =>
                    option
                        .setName('statut')
                        .setDescription('Autoriser ou refuser')
                        .setRequired(true)
                        .setChoices(
                            { name: 'Autoriser', value: 'allow' },
                            { name: 'Refuser', value: 'deny' },
                            { name: 'Neutre', value: 'neutral' }
                        ))
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Le rôle concerné (everyone si non précisé)')
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('salon1')
                        .setDescription('Premier salon (optionnel)')
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('salon2')
                        .setDescription('Deuxième salon (optionnel)')
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('salon3')
                        .setDescription('Troisième salon (optionnel)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('salon')
                .setDescription('Définir rapidement les permissions d\'un salon')
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setDescription('Type de salon')
                        .setRequired(true)
                        .setChoices(
                            { name: 'Annonce', value: 'annonce' },
                            { name: 'Chat', value: 'chat' },
                            { name: 'Média', value: 'media' },
                            { name: 'Commandes', value: 'commandes' }
                        ))
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Le rôle concerné (everyone si non précisé)')
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('salon')
                        .setDescription('Le salon à configurer')
                        .setRequired(true))),

    async execute(interaction) {
        if (!interaction.member.permissions.has('ManageChannels')) {
            return interaction.reply({
                content: '❌ Vous n\'avez pas la permission de gérer les salons.',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply({ ephemeral: true });

        try {
            if (subcommand === 'salon') {
                const type = interaction.options.getString('type');
                const role = interaction.options.getRole('role') || interaction.guild.roles.everyone;
                const channel = interaction.options.getChannel('salon');

                let permissions = {};
                
                switch (type) {
                    case 'annonce':
                        permissions = {
                            [PermissionFlagsBits.ViewChannel]: true,
                            [PermissionFlagsBits.SendMessages]: false,
                            [PermissionFlagsBits.ReadMessageHistory]: true,
                            [PermissionFlagsBits.AddReactions]: true
                        };
                        break;
                    case 'chat':
                        permissions = {
                            [PermissionFlagsBits.ViewChannel]: true,
                            [PermissionFlagsBits.SendMessages]: true,
                            [PermissionFlagsBits.ReadMessageHistory]: true,
                            [PermissionFlagsBits.AddReactions]: true,
                            [PermissionFlagsBits.EmbedLinks]: true,
                            [PermissionFlagsBits.AttachFiles]: true
                        };
                        break;
                    case 'media':
                        permissions = {
                            [PermissionFlagsBits.ViewChannel]: true,
                            [PermissionFlagsBits.SendMessages]: true,
                            [PermissionFlagsBits.ReadMessageHistory]: true,
                            [PermissionFlagsBits.AttachFiles]: true,
                            [PermissionFlagsBits.EmbedLinks]: true,
                            [PermissionFlagsBits.UseExternalEmojis]: true
                        };
                        break;
                    case 'commandes':
                        permissions = {
                            [PermissionFlagsBits.ViewChannel]: true,
                            [PermissionFlagsBits.SendMessages]: false,
                            [PermissionFlagsBits.UseApplicationCommands]: true,
                            [PermissionFlagsBits.ReadMessageHistory]: true
                        };
                        break;
                }

                await channel.permissionOverwrites.edit(role, permissions);
                
                await interaction.editReply({
                    content: `✅ Permissions du salon ${channel.name} configurées pour le type "${type}" avec le rôle ${role.name}.`
                });

            } else {
                const permission = interaction.options.getString('permission');
                const status = interaction.options.getString('statut');
                const role = interaction.options.getRole('role') || interaction.guild.roles.everyone;
                
                const channels = [];
                for (let i = 1; i <= 3; i++) {
                    const channel = interaction.options.getChannel(`salon${i}`);
                    if (channel) channels.push(channel);
                }

                if (channels.length === 0) {
                    channels.push(...interaction.guild.channels.cache.values());
                }

                const permissionBit = permissionsMap[permission];
                if (!permissionBit) {
                    return interaction.editReply({
                        content: '❌ Permission non reconnue.'
                    });
                }

                let permissionValue;
                switch (status) {
                    case 'allow':
                        permissionValue = true;
                        break;
                    case 'deny':
                        permissionValue = false;
                        break;
                    case 'neutral':
                        permissionValue = null;
                        break;
                }

                let successCount = 0;
                let errorCount = 0;

                for (const channel of channels) {
                    try {
                        await channel.permissionOverwrites.edit(role, {
                            [permissionBit]: permissionValue
                        });
                        successCount++;
                    } catch (error) {
                        console.error(`Erreur avec le salon ${channel.name}:`, error);
                        errorCount++;
                    }
                }

                await interaction.editReply({
                    content: `✅ Permission "${permission}" ${status === 'allow' ? 'autorisée' : status === 'deny' ? 'refusée' : 'neutralisée'} pour le rôle ${role.name}.\n📊 Succès: ${successCount}, Erreurs: ${errorCount}`
                });
            }

        } catch (error) {
            console.error('Erreur lors de la modification des permissions:', error);
            await interaction.editReply({
                content: `❌ Erreur lors de la modification des permissions: ${error.message}`
            });
        }
    },
};
