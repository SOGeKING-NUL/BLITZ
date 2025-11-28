import {createClient, RedisClientType} from "redis";
import "dotenv/config";

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType>{
  if(!redisClient){
    redisClient= createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    redisClient.on('connect', ()=> {
      console.log("redis client connected");
    });

    redisClient.on('error', (err)=>{
      console.error('redis client rrror', err);
    });

    await redisClient.connect(); //defining the .on fuinctions before connecting since events can be emitted as soon as connection is made

    await redisClient.configSet('notify-keyspace-events', 'Ex'); //subscribes to events that happen when keys and Ex is for when a key expires
  };

  return redisClient;
}

export async function closeRedisClient(){

  if(redisClient){
    await redisClient.quit();
    redisClient=null;
    console.log("redis client closed");
  };

};

getRedisClient();