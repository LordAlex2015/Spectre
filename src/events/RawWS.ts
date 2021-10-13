import DiscordEvent from "../Structure/DiscordEvent";
import type Client from "../main";
import {red} from "colors";
import * as events from '../Config/Events.compability.json';
import * as audit_events from '../Config/Events.logs.json';

class RawEvent extends DiscordEvent {
    static event: string;

    constructor(client: Client) {
        super(client, "rawWS");
        this.client = client;
    }

    async run(packet: any) {
        if (packet.t === "PRESENCE_UPDATE" || packet.t === null || packet.t === "READY") return;
        if (this.client.config.ignore_events.includes(packet.t)) return;
        console.log(packet)
        if ((packet.d?.author?.id === this.client.user?.id && packet.t === "MESSAGE_CREATE") || packet.d?.user?.id === this.client.user?.id) {
            setTimeout(async () => {
                if (!Object.keys(events).includes(packet.t)) {
                    if (this.client.config.mode === "debug") console.log(red("[Spectre]"), "Unknown event:", packet.t)
                } else {
                    await this.client.Verificator.handle(Object.entries(events).find(k => k[0] === packet.t)[1], packet.d?.id, [packet.d?.id, packet.d?.channel_id, packet.d?.guild_id])
                }
            }, 3001)
        } else if(packet.t !== "MESSAGE_CREATE" && packet.t !== "MESSAGE_UPDATE")  {
            if (packet.d?.guild_id) {
                const logs = await this.client.getGuildAuditLog(packet.d?.guild_id, {
                    actionType: (Object.entries(audit_events).find(k => k[0] === packet.t) || [null, null])[1],
                    //userID: this.client.user.id,
                    limit: 1
                });
                const log = logs.entries[0];
                console.log(log?.user?.id);
                console.log(logs)
                if (!log) return;
                console.log("Log Exist for", packet.t)
                let usIndex = 0;
                if(packet.t === "GUILD_BAN_ADD" || packet.t === "GUILD_BAN_REMOVE") usIndex = 1;
                if (logs.users[usIndex].id !== this.client.user.id) return;
                let typp = (Object.entries(audit_events).find(k => k[0] === packet.t) || [null, null])[1];
                if(typp === null && packet.t === "CHANNEL_PINS_UPDATE") {
                    if(packet.d.last_pin_message === null) {
                        typp = 75
                    } else {
                        typp = 74
                    }
                }
                console.log(packet.t, "xx", typp)
                if (log.actionType !== typp) return;
                let target = (packet.d?.id || this.client.user.id);
                if(packet.t === "MESSAGE_DELETE_BULK") target = packet.d?.channel_id;
                if(packet.t === "GUILD_ROLE_CREATE") target = packet.d?.role.id;
                if(packet.t === "GUILD_ROLE_DELETE") target = packet.d?.role_id;
                if(packet.t === "GUILD_BAN_ADD" || packet.t === "GUILD_BAN_REMOVE") target = packet.d?.user.id;
                console.log((log.targetID !== target))
                if ((log.targetID !== target)) return;
                let data = [packet.d?.id, log.targetID, packet.d?.guild_id];
                let id = packet.d?.id;
                if(packet.t === "GUILD_BAN_ADD" || packet.t === "GUILD_BAN_REMOVE") {
                    data = [packet.d?.user.id, packet.d?.guild_id, log.reason || "None"];
                    id = packet.d?.user.id
                } else if (packet.t === "CHANNEL_CREATE" || packet.t === "CHANNEL_DELETE") {
                    data = [packet.d?.name, packet.d?.id, packet.d?.guild_id, packet.d?.type === 0 ? 'Text' : packet.d?.type, log.reason || "None"];
                } else if (packet.t === "CHANNEL_UPDATE") {
                    let updated = []
                    console.log(log.after)
                    console.log(log.before)
                    if(log.after.name !== log.before.name) {
                        updated.push("Name")
                    }
                    if(log.after.bitrate !== log.before.bitrate) {
                        updated.push("Bitrate")
                    }
                    if(log.after.topic !== log.before.topic) {
                        updated.push("Topic")
                    }
                    if(log.after.nsfw !== log.before.nsfw) {
                        updated.push("NSFW")
                    }
                    if(log.after.rate_limit_per_user !== log.before.rate_limit_per_user) {
                        updated.push("RateLimitPerUser")
                    }
                    if(log.after.parentID !== log.before.parentID) {
                        updated.push("Parent")
                    }
                    data = [packet.d?.name, updated.join(', '), packet.d?.id, packet.d?.guild_id, packet.d?.type === 0 ? 'Text' : packet.d?.type, log.reason || "None"];
                } else if(packet.t === "GUILD_ROLE_CREATE") {
                    id = packet.d?.role.id
                    data = [packet.d?.role.id, packet.d?.role.name,packet.d?.guild_id, log.reason || "None"]
                }else if(packet.t === "GUILD_ROLE_DELETE") {
                    id = packet.d?.role_id
                    data = [packet.d?.role_id, log.before?.name,packet.d?.guild_id, log.reason || "None"]
                } else if (packet.t === "CHANNEL_PINS_UPDATE") {
                    data = [log.message.id, packet.d?.channel_id, packet.d?.guild_id, log.reason || "None"];
                } else if(packet.t === "MESSAGE_DELETE_BULK") {
                    id = packet.d?.channel_id
                    data = [packet.d?.ids.join(", "), packet.d?.channel_id, packet.d?.guild_id, log.reason || "None"];
                }

                setTimeout(async () => {
                    if (!Object.keys(events).includes(packet.t)) {
                        if (this.client.config.mode === "debug") console.log(red("[Spectre]"), "Unknown event:", packet.t)
                    } else {
                        await this.client.Verificator.handle(Object.entries(events).find(k => k[0] === packet.t)[1], id, data)
                    }
                }, 3001)
            }
        }
    }


}

module.exports = RawEvent;