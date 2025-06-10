const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken('VOTRE_TOKEN_BOT');

(async () => {
    try {
        console.log(`🔄 Déploiement de ${commands.length} commandes...`);

        // Pour les commandes globales (peuvent prendre jusqu'à 1h pour apparaître)
        // const data = await rest.put(Routes.applicationCommands('VOTRE_APPLICATION_ID'), { body: commands });

        // Pour les commandes de guilde (instantanées, recommandé pour les tests)
        const data = await rest.put(
            Routes.applicationGuildCommands('VOTRE_APPLICATION_ID', 'VOTRE_GUILD_ID'), 
            { body: commands }
        );

        console.log(`✅ ${data.length} commandes déployées avec succès!`);
    } catch (error) {
        console.error('❌ Erreur lors du déploiement des commandes:', error);
    }
})();
