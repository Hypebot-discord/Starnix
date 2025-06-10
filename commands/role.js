const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Gestion des rôles')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Ajouter un rôle')
                .addRoleOption(option =>
                    option
                        .setName('role_ajoute')
                        .setDescription('Le rôle à ajouter')
                        .setRequired(true))
                .addRoleOption(option =>
                    option
                        .setName('role_concerne')
                        .setDescription('Le rôle concerné (everyone si non précisé)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Retirer un rôle')
                .addRoleOption(option =>
                    option
                        .setName('role_retire')
                        .setDescription('Le rôle à retirer')
                        .setRequired(true))
                .addRoleOption(option =>
                    option
                        .setName('role_concerne')
                        .setDescription('Le rôle concerné (everyone si non précisé)')
                        .setRequired(false))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const targetRole = interaction.options.getRole(subcommand === 'add' ? 'role_ajoute' : 'role_retire');
        const concernedRole = interaction.options.getRole('role_concerne');

        if (!interaction.member.permissions.has('ManageRoles')) {
            return interaction.reply({
                content: '❌ Vous n\'avez pas la permission de gérer les rôles.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            let members;
            if (concernedRole) {
                members = concernedRole.members;
            } else {
                members = interaction.guild.members.cache;
            }

            let successCount = 0;
            let errorCount = 0;

            for (const [, member] of members) {
                try {
                    if (subcommand === 'add') {
                        if (!member.roles.cache.has(targetRole.id)) {
                            await member.roles.add(targetRole);
                            successCount++;
                        }
                    } else {
                        if (member.roles.cache.has(targetRole.id)) {
                            await member.roles.remove(targetRole);
                            successCount++;
                        }
                    }
                } catch (error) {
                    console.error(`Erreur avec ${member.user.tag}:`, error);
                    errorCount++;
                }
            }

            const action = subcommand === 'add' ? 'ajouté' : 'retiré';
            const target = concernedRole ? `aux membres ayant le rôle ${concernedRole.name}` : 'à tous les membres';
            
            await interaction.editReply({
                content: `✅ Rôle ${targetRole.name} ${action} ${target}.\n📊 Succès: ${successCount}, Erreurs: ${errorCount}`
            });

        } catch (error) {
            console.error('Erreur lors de la gestion des rôles:', error);
            await interaction.editReply({
                content: `❌ Erreur lors de la gestion des rôles: ${error.message}`
            });
        }
    },
};
