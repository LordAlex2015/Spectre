'use strict';
import * as Eris from "eris";
import * as config from '../config.json';
import {blue} from 'colors';
import RedisClient from './Systems/Redis';
import EventsManager from "./Structure/EventsManager";
import Verificator from "./Systems/Verificator";
import parseText from "./Systems/TextParser";
import {sendWebhook} from "./Systems/Answer";
import {genDiscordAnswer} from "./Systems/Action";

export default class Spectre extends Eris.Client {
    config: SpectreConfig;
    Redis: RedisClient;
    events: EventsManager;
    Verificator: Verificator;
    warnings: Map<string, {_id: string, times: number, last: number, last_danger_reported: number}>;

    constructor() {
        super(config.discord.token, {
            intents: ["guilds", "guildMembers", "guildBans", "guildEmojis", "guildIntegrations", "guildWebhooks", "guildInvites", "guildVoiceStates", "guildPresences", "guildMessages"]
        });
        this.config = config;
        this.Verificator = new Verificator(this);
        this.Redis = new RedisClient()
        this.events = new EventsManager(this)
        this.warnings = new Map()
        try {
            this.init()
            console.log(blue(this.config.custom.text.console.start_menu.connecting_to_discord));
        } catch (e: any) {
            throw e
        }
        try {
            this.connect()
        } catch(e) {
            console.error(e)
        }
    }

    init(): any {
        try {
            this.prepare()
            this.events.loadEvent();
            this._processEvent();
        } catch (e) {
            throw new Error(`An error occurred during initialization: ${e}`)
        }
    }

    async prepare() {
        if(!this.config.settings.notify_discord /*&& !this.config.settings.regen_token */) {
            throw new Error("Discord Notifications are disabled, Spectre is useless. Stopping...");
        }
        if (this.config.custom.text.console.start_menu.connecting_to_discord === "") {
            throw new Error("Invalid Config File. Stopping...");
        }
        if(this.config.settings.regen_token && this.config.github.token.length !== 255) {
            throw new Error("Invalid Github Access Token. Stopping...");
        }
        if(!['WARNING','DANGER','NOTHING'].includes(this.config.settings.regen_on)) {
            throw new Error("Invalid 'regen_on' param. Stopping...");
        }
        if (this.config.discord.emergency_webhook.token.length !== 68 && this.config.settings.notify_discord) throw new Error("Invalid Emergency Webhook token.");
        if (this.config.discord.emergency_webhook.id.length !== 18 && this.config.settings.notify_discord) throw new Error("Invalid Emergency Webhook id.");
        this.config.custom.embed_footer = {text: await parseText(this, this.config.custom.embed_footer.text)};
    }

    _processEvent() {
        process.on('exit', () => {
            sendWebhook(this, this.config, genDiscordAnswer(this, "DANGER", ["Spectre is shutting down.", "Someone is shutting down Spectre.", []]));
        })
    }
}

export interface SpectreConfig {
    mode: string;
    version: string;
    "ignore_events": string[];
    settings: {regen_token: boolean; notify_discord: boolean; regen_on: string};
    redis: { host: string, password: string };
    discord: { token: string, notified: string[], emergency_webhook: { token: string, id: string } };
    github: {token: string};
    custom: {
        embed_colors: { default: number, danger: number, success: number, warning: number, info: number },
        embed_icons: { danger: string, success: string, warning: string, info: string },
        text: {
            console: {
                start_menu: {
                    redis_connected: string, connecting_to_discord: string
                }
            },
            embed: {
                danger_title: string,
                warning_title: string
            }
            },
        embed_footer: { text: string } }
}
try {
    new Spectre()
} catch(e) {
    console.error(e)
}

process.on("uncaughtException", (e) => {
    console.error(e)
})