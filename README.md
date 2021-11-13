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
- Add Github access token, to regen the bot token in need
- Set `regen_token` on `true`
- Edit `src/Config/Events.ratio.json` **(The ratio is the number of times the WARNING event for a specific event must be triggered before triggering the danger event)**

## Starting
- `npm run` or `tsc && node dist/main`

## Compatibility
- 11/15 events 
- [X] messageCreate
- [X] messageDeleteBulk
- [X] messageUpdate
- [X] channelCreate
- [X] channelDelete
- [X] channelPinsUpdate
- [X] channelUpdate
- [X] guildBanAdd
- [X] guildBanRemove
- [ ] guildMemberRemove
- [ ] guildMemberUpdate
- [X] guildRoleCreate
- [ ] guildRoleUpdate
- [X] guildRoleDelete
- [ ] guildUpdate

## Plans
- [ ] Customization
- [X] (Alpha) Customization
- [X] Token Regeneration
- [X] Sensibility Correction
- [ ] Telegram Notifications
- [X] Discord Notifications
- [ ] Better Redis utilisation
- [X] (Alpha) AntiFail System
- [X] (Not Finished) Errors Catching
- [ ] Update Reminder
- [X] Notify on shutdown

