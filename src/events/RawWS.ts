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
        } else if (!packet.d?.author?.id && !packet.d?.user?.id) {
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
                if (logs.users[0].id !== this.client.user.id) return;
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
                console.log((log.targetID !== (packet.d?.id || this.client.user.id)))
                if ((log.targetID !== (packet.d?.id || this.client.user.id))) return;
                let data = [packet.d?.id, log.targetID, packet.d?.guild_id];
                if (packet.t === "CHANNEL_CREATE" || packet.t === "CHANNEL_DELETE") {
                    data = [packet.d?.name, packet.d?.id, packet.d?.guild_id, packet.d?.type === 0 ? 'Text' : packet.d?.type, log.reason || "None"];
                } else if (packet.t === "CHANNEL_PINS_UPDATE") {
                    data = [log.message.id, packet.d?.channel_id, packet.d?.guild_id, log.reason || "None"];
                }
                if (log.channel) {
                    // MEMBER_MOVE MESSAGE_DELETE/PIN/UNPIN

                } else if (log.deleteMemberDays) {
                    // MEMBER_PRUNE

                } else if (log.member) {
                    // CHANNEL_OVERWRITE_CREATE/UPDATE/DELETE

                } else if (log.role) {
                    // CHANNEL_OVERWRITE_CREATE/UPDATE/DELETE

                }
                setTimeout(async () => {
                    if (!Object.keys(events).includes(packet.t)) {
                        if (this.client.config.mode === "debug") console.log(red("[Spectre]"), "Unknown event:", packet.t)
                    } else {
                        await this.client.Verificator.handle(Object.entries(events).find(k => k[0] === packet.t)[1], packet.d?.id, data)
                    }
                }, 3001)
            }
        }
    }


}

module.exports = RawEvent;