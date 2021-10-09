import Spectre, {SpectreConfig} from "../main";
import fetch from 'node-fetch';

export async function genAnswer(config: SpectreConfig, type: "INFO" | "DANGER" | "SUCCESS" | "WARNING" | "NONE", args: any[]) {
    switch(type) {
        case "DANGER":
                return {
                    content: "<@" + config.discord.notified.join(">, <@") + ">",
                    embeds: [{
                        author: {
                            name: "Spectre System - Danger",
                            icon_url: "https://i.arvix.ml/Spectre_White.png"
                        },
                        title: args[0],
                        description: args[1],
                        fields: args[2],
                        color: config.custom.embed_colors.danger || 5793266,
                        thumbnail: {
                            url: config.custom.embed_icons.danger || ""
                        },
                        //footer: config.custom.embed_footer,
                        timestamp: new Date(Date.now() - 3000)
                    }]
                }
            break;
        case "WARNING":
            return {
                embeds: [{
                    author: {
                        name: "Spectre System - Warning",
                        icon_url: "https://i.arvix.ml/Spectre_White.png"
                    },
                    title: args[0],
                    description: args[1],
                    fields: args[2],
                    color: config.custom.embed_colors.warning || 16705372,
                    thumbnail: {
                        url: config.custom.embed_icons.warning || ""
                    },
                    //footer: config.custom.embed_footer,
                    timestamp: new Date(Date.now() - 3000)
                }]
            }
            break;
    }
}

export async function sendWebhook(client: Spectre, config: SpectreConfig, message: any) {
    return new Promise(async resolve => {
        await fetch(`https://discord.com/api/v9/webhooks/${config.discord.emergency_webhook.id}/${config.discord.emergency_webhook.token}`, {
            method: "POST",
            headers: {
                'Content-Type':"application/json"
            },
            body: JSON.stringify(message)
        }).then((res: any) => {
            resolve(res)
        }).catch(() => {})
    })
}