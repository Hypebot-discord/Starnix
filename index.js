const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

// Collections pour stocker les commandes
client.commands = new Collection();

// Charger les commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

// Charger les événements
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

// Fonction pour vérifier les autorisations
function checkPermissions(userId, commandName) {
    // Toujours autoriser ton ID
    if (userId === '1303819587518726186') return true;
    
    // Vérifier les autorisations personnalisées
    try {
        const authData = JSON.parse(fs.readFileSync('./data/authorizations.json', 'utf8'));
        return authData[userId] && authData[userId].includes(commandName);
    } catch (error) {
        console.error('Erreur lors de la vérification des autorisations:', error);
        return false;
    }
}

client.on(Events.ClientReady, () => {
    console.log(`✅ ${client.user.tag} est en ligne !`);
    
    // Créer le dossier data s'il n'existe pas
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data');
    }
    
    // Créer le fichier d'autorisations s'il n'existe pas
    if (!fs.existsSync('./data/authorizations.json')) {
        fs.writeFileSync('./data/authorizations.json', '{}');
    }
    
    // Créer le fichier de maintenance s'il n'existe pas
    if (!fs.existsSync('./data/maintenance.json')) {
        fs.writeFileSync('./data/maintenance.json', '{}');
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    // Vérifier les autorisations
    if (!checkPermissions(interaction.user.id, interaction.commandName)) {
        return interaction.reply({
            content: '❌ Vous n\'avez pas l\'autorisation d\'utiliser cette commande.',
            ephemeral: true
        });
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ Erreur lors de l'exécution de la commande ${interaction.commandName}:`, error);
        
        const errorMessage = `❌ Une erreur est survenue lors de l'exécution de la commande.\n\`\`\`${error.message}\`\`\``;
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

client.login('');
