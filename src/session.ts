import { randomUUID } from "crypto";
import {getRedisClient} from "./redis.ts";

const SESSION_KEY_PREFIX= "session:";
const SESSION_TTL= 600; //10 minutes in seconds

export interface Session{
  session_id: string,
  messages: SessionMessages[] //array of messages in the session of type SessionMessages
};

export interface SessionMessages{
  role: 'user' | 'assistant',
  content: string,
  timestamp: string,
}

function generateSessionId(): string{
  return randomUUID();
}

function getSessionKey(sessionId: string): string{
  return `${SESSION_KEY_PREFIX}${sessionId}`;
}

export async function getOrCreateSession(sessionId?: string): Promise<Session>{

  const client = await getRedisClient();
  
  if(sessionId){
    try{
      const sessionKey= getSessionKey(sessionId);
      const sessionData= await client.get(sessionKey);  
      if(sessionData){
        const parsed : Session= JSON.parse(sessionData) as Session;
        return parsed;
      }
    }catch(err){
      console.error("Error retrieving session:", err);
    }   
  }

  //if no sessionId, create new session
  const newSessionId= generateSessionId();
  const newSession: Session ={
    session_id: newSessionId,
    messages: [],
  };

  try{    
    await client.setEx(
      getSessionKey(newSessionId),
      SESSION_TTL,
      JSON.stringify(newSession)
    );

    return newSession;
  }catch(err){
    console.error("Error creating session:", err);
    throw new Error('Failed to create session');
  };

};

export async function getSessionMessages(sessionId: string): Promise<SessionMessages[]>{
  const client= await getRedisClient();

  try{
    const sessionKey= getSessionKey(sessionId);
    const sessionData= await client.get(sessionKey);
    if(sessionData){

      const parsed: Session= JSON.parse(sessionData) as Session;
      return parsed.messages || [];

    }else{
      return [];
    };
  }catch(err){
    console.log("error fetching messages", err);
    return [];
  };  
}

export async function addMessagetoSession(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<SessionMessages[]>{
  const client= await getRedisClient();

  try{
    const sessionKey= getSessionKey(sessionId);
    const sessionData= await client.get(sessionKey);

    if(sessionData){
      const parsed= JSON.parse(sessionData) as Session;
      const newMessage: SessionMessages ={
        role,
        content,
        timestamp: new Date().toISOString()        
      };
      
      parsed.messages.push(newMessage);

      await client.setEx(
        sessionKey,
        SESSION_TTL,
        JSON.stringify(parsed)        
        );
      
      return parsed.messages;
    }

    throw new Error("session not found")

  }catch(err){
    console.error("error while adding messages", err);
    throw new Error("session not found")
  }
}
