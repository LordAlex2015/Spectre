import Spectre from "../main";
import {green, red} from "colors";
import {genAnswer, sendWebhook} from "./Answer";
import * as ratios from '../Config/Events.ratio.json';

export default class Verificator {
    private client: Spectre;
    constructor(client: Spectre) {
        this.client = client;
    }

    async handle(eventType: string, id: string, args: any[]) {
        if(await this.client.Redis.get(`SpectreSystem:XX:${id}`)) {
            if(this.client.config.mode === "debug") console.log(green("[Spectre]"),"Action Clear", await this.client.Redis.get(`SpectreSystem:XX:${id}`))
            return;
        }
        if(!await this.client.Redis.get(`SpectreSystem:${eventType}:${id}`)) {
            // Action unauthorized
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
                default:
                    description = `<#${args[1]}>`
                    fields.push({
                        name: "👥・Identity:",
                        value: `\`\`\`css\nName: ${args[0]}\nType: ${args[3]}\nChannel ID: ${args[1]}\nGuild ID: ${args[2]}\nReason: ${args[4]}\`\`\``
                    });
                    break;
            }
            const warns = this.client.warnings.get(eventType);
            let type: 'WARNING' | 'DANGER' = "WARNING"
            if(!warns) {
                if((5 / Object.entries(ratios).find(k => k[0] === eventType)[1]) === 1) {
                    this.client.warnings.set(eventType, {
                        _id: eventType,
                        times: 1,
                        last: Date.now(),
                        last_danger_reported: Date.now()
                    });
                    type = "DANGER";
                } else {
                    this.client.warnings.set(eventType, {
                        _id: eventType,
                        times: 1,
                        last: Date.now(),
                        last_danger_reported: 0
                    })
                }
            } else {
                if(warns.times >= (5 / Object.entries(ratios).find(k => k[0] === eventType)[1])) {
                    if((Date.now() - warns.last) >= 1000 && (Date.now() - warns.last_danger_reported) >= 3600000) {
                        warns.last_danger_reported = Date.now();
                        type = "DANGER"
                    }
                }
                warns.times++;
                warns.last = Date.now();
                this.client.warnings.set(warns._id, warns)
            }
            if(this.client.config.mode === "debug") console.log(red("[Spectre]"), "Unauthorized action! ID:",id);
            sendWebhook(this.client, this.client.config, await genAnswer(this.client.config, type, [title,description,fields]))
        } else {
            // Action passed
            if(this.client.config.mode === "debug") console.log(green("[Spectre]"),"Action Clear", await this.client.Redis.get(`SpectreSystem:${eventType}:${id}`))
        }
    }

}