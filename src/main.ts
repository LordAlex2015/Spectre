'use strict';
import * as Eris from "eris";
import * as config from '../config.json';
import {blue} from 'colors';
import RedisClient from './Systems/Redis';
import EventsManager from "./Structure/EventsManager";
import * as config2 from '../src/Config/default.config.json';
import Verificator from "./Systems/Verificator";

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
        this.connect();
    }

    init(): any {
        try {
            this.prepare()
            this.events.loadEvent();
        } catch (e) {
            throw new Error(`An error occurred during initialization: ${e}`)
        }
    }

    prepare() {
        this.config.custom.embed_footer = {text: `Spectre System - ${this.config.version}`};
        if (this.config.discord.emergency_webhook.token.length !== 68) throw new Error("Invalid Emergency Webhook token!");
        if (this.config.discord.emergency_webhook.id.length !== 18) throw new Error("Invalid Emergency Webhook id!");
        if (this.config.custom.text.console.start_menu.connecting_to_discord === "") {
            console.error("Invalid Config file, loading default");
            const discord = this.config.discord;
            this.config = config2;
            this.config.discord = discord;
        }
    }

}

export interface SpectreConfig {
    mode: string;
    version: string;
    "ignore_events": string[];
    redis: { host: string, password: string };
    discord: { token: string, notified: string[], emergency_webhook: { token: string, id: string } };
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