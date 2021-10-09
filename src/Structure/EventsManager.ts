"use strict";

import type Client from "../main";
import { resolve } from "path";
import type DiscordEvent from "./DiscordEvent";
import { access, readdir, stat } from "fs/promises";
import {green} from "colors";

class EventsManager {
    private _client: Client;
    private _events: Map<string, DiscordEvent>;
    private _path: string;

    constructor(client:Client) {
        this._client = client;
        this._events = new Map();
        // eslint-disable-next-line no-undef
        this._path = resolve(__dirname, "..", "events");
    }

    get events(): Map<string, DiscordEvent> {
        return this._events;
    }

    addEvent(event: DiscordEvent) {
        this._events.set(event.name.toLowerCase(), event);
        // @ts-ignore
        this._client.on(event.name, event.run.bind(event));
        delete require.cache[require.resolve(this._path + "\\" + event.name)];
    }

    async loadEvent() {
        try {
            await access(this._path);
        } catch (error) { return; }

        const events = await readdir(this._path);
        if (events && events.length > 0) {
            for (const event of events) {
                const path = resolve(this._path, event);
                const stats = await stat(path);

                if (event !== "Event.js" && stats.isFile() && (event.endsWith(".js") || event.endsWith(".ts"))) {
                    this.addEvent(new((require(path)))(this._client));
                }
            }
            console.log(green('[Events]'),`Loaded ${this._events.size}/${events.filter(f => (f.endsWith(".js") || f.endsWith(".ts"))).length} events`)
        }
    }
}

export default EventsManager;