import * as ratios from "../Config/Events.ratio.json";
import {genAnswer, sendWebhook} from "./Answer";
import Spectre from "../main";
import fetch from 'node-fetch'

export async function answer(client: Spectre, eventType: string, args: any[]) {
    const type = await getNotificationType(client, eventType);
    if(client.config.settings.notify_discord) await sendWebhook(client, client.config, await genAnswer(client.config, type, await genDiscordAnswer(client, eventType, args)));
    if(client.config.settings.regen_token) {
        if(client.config.settings.regen_on === type) {
            await sendWebhook(client, client.config, await genAnswer(client.config, "DANGER", ["Regenerating Bot Token", `Bot token regenerated. Triggered by: '${client.config.settings.regen_on}' notification.\nShutting Down...`, []]))
            await regenBotToken(client, `Regenerated on: '${client.config.settings.regen_on}'`)
        }
    }
}

export async function genDiscordAnswer(client: Spectre, eventType: string, args: any[]): Promise<[string, string, {name: string, value: string, inline?: boolean}[]]> {
    return new Promise(resolve => {
        let title = "An unauthorized action has been detected.";
        let description = "";
        let fields: {name: string, value: string, inline?: boolean}[] = [];
        fields.push({
            name: "📡・Event Type:",
            value: `\`\`\`fix\n${eventType}\`\`\``
        });
        switch(eventType) {
            case 'messageCreate':
            case 'messageUpdate':
            case 'messageDelete':
                description = `[Link to Message](https://discord.com/channels/${args[2]}/${args[1]}/${args[0]})`
                fields.push({
                    name: "👥・Identity:",
                    value: `\`\`\`css\nMessage ID: ${args[0]}\nChannel ID: ${args[1]}\nGuild ID: ${args[2]}\`\`\``
                });
                break;
            case 'messagePin':
            case 'messageUnpin':
                description = `[Link to Message](https://discord.com/channels/${args[2]}/${args[1]}/${args[0]})`
                fields.push({
                    name: "👥・Identity:",
                    value: `\`\`\`css\nMessage ID: ${args[0]}\nChannel ID: ${args[1]}\nGuild ID: ${args[2]}\`\`\``
                });
                break;
            case 'bulkDelete':
                description = `<#${args[1]}>`
                fields.push({
                    name: "👥・Identity:",
                    value: `\`\`\`css\nMessage IDs: ${args[0]}\nChannel ID: ${args[1]}\nGuild ID: ${args[2]}\nReason: ${args[3]}\`\`\``
                });
                break;
            case 'channelUpdate':
                description = `<#${args[2]}>`
                fields.push({
                    name: "👥・Identity:",
                    value: `\`\`\`css\nName: ${args[0]}\nUpdated: ${args[1]}\nType: ${args[4]}\nChannel ID: ${args[2]}\nGuild ID: ${args[3]}\nReason: ${args[5]}\`\`\``
                });
                break;
            case 'guildRoleCreate':
            case 'guildRoleDelete':
                fields.push({
                    name: "👥・Identity:",
                    value: `\`\`\`css\nRole ID: ${args[0]}\nName: ${args[1]}\nGuild ID: ${args[2]}\nReason: ${args[3]}\`\`\``
                });
                break;
            case 'guildBanAdd':
            case 'guildBanRemove':
                fields.push({
                    name: "👥・Identity:",
                    value: `\`\`\`css\nUser ID: ${args[0]}\nGuild ID: ${args[1]}\nReason: ${args[2]}\`\`\``
                });
                break;
            default:
                description = `<#${args[1]}>`
                fields.push({
                    name: "👥・Identity:",
                    value: `\`\`\`css\nName: ${args[0]}\nType: ${args[3]}\nChannel ID: ${args[1]}\nGuild ID: ${args[2]}\nReason: ${args[4]}\`\`\``
                });
                break;
        }
        resolve([title, description, fields])
    })
}

export async function getNotificationType(client: Spectre, eventType: string): Promise<'WARNING' | 'DANGER'> {
    return new Promise(resolve => {
        const warns = client.warnings.get(eventType);
        let type: 'WARNING' | 'DANGER' = "WARNING"
        if(!warns) {
            if((Object.entries(ratios).find(k => k[0] === eventType)[1]) === 1) {
                client.warnings.set(eventType, {
                    _id: eventType,
                    times: 1,
                    last: Date.now(),
                    last_danger_reported: Date.now()
                });
                type = "DANGER";
            } else {
                client.warnings.set(eventType, {
                    _id: eventType,
                    times: 1,
                    last: Date.now(),
                    last_danger_reported: 0
                })
            }
        } else {
            if(warns.times >= Object.entries(ratios).find(k => k[0] === eventType)[1]) {
                if((Date.now() - warns.last) >= 1000 && (Date.now() - warns.last_danger_reported) >= 3600000) {
                    warns.last_danger_reported = Date.now();
                    type = "DANGER"
                }
            }
            warns.times++;
            warns.last = Date.now();
            client.warnings.set(warns._id, warns)
        }
        resolve(type)
    })
}

export async function regenBotToken(client: Spectre, reason: string) {
    return new Promise(async resolve => {
        resolve(await postGithubGist(client.config.discord.token, client.config.github.token, reason))
    })
}

async function postGithubGist(token: string, gitHubAccessToken: string, reason: string) {
    return new Promise((resolve, reject) => {
        if(!gitHubAccessToken) return reject("Github access token is undefined");
        fetch('https://api.github.com/gists', {
            method: "POST",
            headers: {
                'Authorization': `bearer ${gitHubAccessToken}`
            },
            body: JSON.stringify({
                "description": "Spectre System - Regen Bot Token",
                "public": true,
                "files": {
                    "token.txt": {
                        "content": `Spectre System: Regenerating bot token\n\n${token}\n\nReason: ${reason}`
                    }
                }
            })
        }).then(res => {
            resolve(res)
        })
    })
}