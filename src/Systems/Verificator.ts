import Spectre from "../main";
import {green, red} from "colors";
import {answer} from "./Action";

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
            if(this.client.config.mode === "debug") console.log(red("[Spectre]"), "Unauthorized action! ID:",id);
            await answer(this.client, eventType, args);
        } else {
            // Action passed
            if(this.client.config.mode === "debug") console.log(green("[Spectre]"),"Action Clear", await this.client.Redis.get(`SpectreSystem:${eventType}:${id}`))
        }
    }

}