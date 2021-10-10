<img alt="Spectre Logo" height="75" src="https://i.arvix.ml/Spectre_White.png" width="75"/>

# Spectre
*By ArviX#8443*

[Discord Server](https://discord.gg/UvC633NBKS)

Version: **Alpha**

## Requirements
- [Redis](https://redis.io/)
- NodeJS 14 or higher
- Typescript installed ( `npm i typescript -g` )

## Configuration
- Execute command `npm ci`
- Rename `template.config.json` to `config.json`
- Add your bot token
- Add the notification webhook
- Add the notified people
- Edit redis host informations

## Starting
- `npm run` or `tsc && node dist/main`

## Compatibility
- 9/15 events 
- [X] messageCreate
- [X] messageDeleteBulk
- [X] messageUpdate
- [X] channelCreate
- [X] channelDelete
- [X] channelPinsUpdate
- [X] channelUpdate
- [ ] guildBanAdd
- [ ] guildBanRemove
- [ ] guildMemberRemove
- [ ] guildMemberUpdate
- [X] guildRoleCreate
- [ ] guildRoleUpdate
- [X] guildRoleDelete
- [ ] guildUpdate

## Plans
- [ ] Customization
- [X] (Alpha) Customization
- [ ] Token Regeneration
- [ ] Sensibility Correction
- [ ] Telegram Notifications
- [X] Discord Notifications
- [ ] Better Redis utilisation
- [ ] AntiFail System
- [ ] Errors Catching
- [ ] Update Reminder

