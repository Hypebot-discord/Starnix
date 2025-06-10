const { Events, ChannelType } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        try {
            // Vérifier si une maintenance est active
            let maintenanceData = {};
            if (fs.existsSync('./data/maintenance.json')) {
                maintenanceData = JSON.parse(fs.readFileSync('./data/maintenance.json', 'utf8'));
            }

            const guildData = maintenanceData[channel.guild.id];
            if (!guildData || !guildData.active) return;

            const blockedRole = channel.guild.roles.cache.get(guildData.blockedRoleId);
            if (!blockedRole) return;

            // Appliquer la permission "voir les salons" sur "non" pour le rôle bloqué
            await channel.permissionOverwrites.create(blockedRole, {
                ViewChannel: false
            });

            console.log(`✅ Permissions de maintenance appliquées au nouveau salon: ${channel.name}`);

        } catch (error) {
            console.error('Erreur lors de l\'application des permissions de maintenance:', error);
        }
    },
};
