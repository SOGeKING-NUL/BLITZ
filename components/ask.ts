import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ModelMessage, streamText } from "ai";
import "dotenv/config"
import { getRedisClient} from "../utils/redis.ts";
import { getSessionMessages, addMessagetoSession, SessionMessages } from "./session.ts";
import { Session } from "inspector";

const openRouter= createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!
});

const model = openRouter("openai/gpt-4.1-mini");

const CONTEXT_WINDOW= 5;

function toModelMessage(message: {role: 'user' | 'assistant', content: string}): ModelMessage{
  return{
    role: message.role,
    content: message.content
  }
};

export default async function ask(userInput: string, session_id: string){

  const client= await getRedisClient();
  const history: SessionMessages[]= await getSessionMessages(session_id) ;

  const recent= history.slice(-CONTEXT_WINDOW); //get latest 5 messages only
  const modelMessages: ModelMessage[]= recent.map((m)=>
    toModelMessage({role: m.role, content: m.content})
  );

  modelMessages.push({
    role: 'user',
    content: userInput
  });

  await addMessagetoSession(session_id, "user", userInput);

  const result= streamText({
    model,
    messages: modelMessages
  });

  let fullResponse: string= "";

  for await (const word of result.textStream){
    fullResponse += word;
  };

  await addMessagetoSession(session_id, 'assistant', fullResponse);

  return fullResponse;
};