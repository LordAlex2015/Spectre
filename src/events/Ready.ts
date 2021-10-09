import DiscordEvent from "../Structure/DiscordEvent";
import type Client from "../main";
import {green} from "colors";

class ReadyEvent extends DiscordEvent{
    static event: string;
    constructor(client: Client) {
        super(client, "ready");
        this.client = client;
    }

    run() {
        // Ready Event
        console.log(green('[BOT]'),`Connected into ${this.client.user.username}#${this.client.user.discriminator}`)
    }


}
module.exports = ReadyEvent;