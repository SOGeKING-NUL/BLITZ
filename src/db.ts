import { MongoClient, Db } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

let db: Db;

export default async function connectDB(){
    if(!db){
        await client.connect();
        db= client.db("Blitz");  //connects to the database named Blitz
        console.log("Connected to Blitz DB")
    }
    return db;
}
