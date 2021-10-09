import * as redis from 'redis';
import {green} from 'colors'
import * as config from '../../config.json';

export default class RedisClient {
    config: any;
    redis: any;
    get: (key:string) => Promise<string | null>;
    getTempRefresh: (key: string, functionName: any, functionAssets: any[]) => Promise<any>;
    set: (key:string, value: string) => string;
    private setTempData: (key: string, value: string, expire: number) => RegExpExecArray;
    constructor() {
        this.config = config
        this.redis = redis.createClient({
            host: this.config.redis.host,
            password: this.config.redis.password
        })
        this.redis.on('ready', () => {
            console.log(green("[REDIS]"),this.config.custom.text.console.start_menu.redis_connected)
            this.redis.sendCommand("config", ["set", "notify-keyspace-events", "Ex"])
        })
        this.get = (key) => {
            return new Promise(resolve => {
                this.redis.get(key, function(err: any, data: any) {
                    resolve(data)
                })
            })

        }
        this.getTempRefresh = (key, functionName, functionAssets) => {
            return new Promise(resolve => {
                this.redis.get(key, function(err: any, data: any) {
                    if(err) {
                        resolve(functionName(...functionAssets))
                    }
                    if(data !== null) {
                        resolve(data)
                    } else {
                        resolve(functionName(...functionAssets))
                    }
                })
            })
        }
        this.set = (key, value) => {
            return this.redis.set(key,value)
        }
        this.setTempData = (key, value,expire) => {
            return this.redis.multi().set(key, value).expire(key, expire).exec()
        }
    }
}