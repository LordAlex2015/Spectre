import Spectre from "../main";


export default async function parseText(client: Spectre, text: string): Promise<string> {
    return new Promise(async resolve => {
        const replace_list = {
            "{{VERSION}}": client.config.version
        }
        let txt = text;
        await Object.entries(replace_list).forEach(entry => {
            const key = entry[0], value = entry[1];
            for(const match of txt.match(key)) {
                txt.replace(key, value)
            }
        })
        resolve(txt)
    })
}