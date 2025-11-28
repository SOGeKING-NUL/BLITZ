import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ModelMessage, streamText } from "ai";
import "dotenv/config"
import { getSessionMessages, addMessagetoSession, SessionMessages } from "./session.ts";
import { custom_additionTool } from "./tools/mockTools.ts";
const openRouter= createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!
});

const model = openRouter("openai/gpt-4.1-mini");

const CONTEXT_WINDOW= 5;

export interface AskResult {
  response: string;
  tool_used: string | null;
  tool_details: unknown | null;
}

function toModelMessage(message: {role: 'user' | 'assistant', content: string}): ModelMessage{
  return{
    role: message.role,
    content: message.content
  }
};

export default async function ask(userInput: string, session_id: string): Promise<AskResult>{

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
    messages: modelMessages,
    tools: {custom_additionTool}
  });

  let fullResponse: string= "";

  for await (const word of result.textStream){
    fullResponse += word;
  };

  await addMessagetoSession(session_id, 'assistant', fullResponse);

  const toolResults= await result.toolResults;
  const latestTool= toolResults.length ? toolResults[toolResults.length -1] : null;

  return {
    response: fullResponse,
    tool_used: latestTool?.toolName ?? null,
    tool_details: latestTool?.output ?? null,
  };
};