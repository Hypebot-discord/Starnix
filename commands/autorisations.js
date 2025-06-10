const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorisation-bot')
        .setDescription('Autoriser un utilisateur à utiliser une commande du bot')
        .addUserOption(option =>
            option
                .setName('membre')
                .setDescription('L\'utilisateur à autoriser')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('commande')
                .setDescription('La commande à autoriser')
                .setRequired(true)
                .setChoices(
                    { name: 'dev', value: 'dev' },
                    { name: 'role', value: 'role' },
                    { name: 'perms', value: 'perms' },
                    { name: 'autorisation-bot', value: 'autorisation-bot' },
                    { name: 'maintenance', value: 'maintenance' }
                )),

    async execute(interaction) {
        // Seul ton ID peut utiliser cette commande
        if (interaction.user.id !== '1303819587518726186') {
            return interaction.reply({
                content: '❌ Seul le propriétaire du bot peut gérer les autorisations.',
                ephemeral: true
            });
        }

        const user = interaction.options.getUser('membre');
        const command = interaction.options.getString('commande');

        try {
            // Charger les autorisations existantes
            let authData = {};
            if (fs.existsSync('./data/authorizations.json')) {
                authData = JSON.parse(fs.readFileSync('./data/authorizations.json', 'utf8'));
            }

            // Ajouter l'autorisation
            if (!authData[user.id]) {
                authData[user.id] = [];
            }

            if (!authData[user.id].includes(command)) {
                authData[user.id].push(command);
            }

            // Sauvegarder les autorisations
            fs.writeFileSync('./data/authorizations.json', JSON.stringify(authData, null, 2));

            await interaction.reply({
                content: `✅ L'utilisateur ${user.tag} a été autorisé à utiliser la commande \`${command}\`.`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Erreur lors de la gestion des autorisations:', error);
            await interaction.reply({
                content: `❌ Erreur lors de la gestion des autorisations: ${error.message}`,
                ephemeral: true
            });
        }
    },
};
