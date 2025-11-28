import express from 'express';
import ask from '../components/ask.ts';
import { getOrCreateSession } from '../components/session.ts';

const app=express();
const PORT=3000;


app.use(express.json());

app.get('/', (req, res) =>{
    res.json({
        message: "Server is up and running"
    });
});

app.post('/chat', async (req, res)=>{
    const {message, session_id} =req.body as {message: string, session_id: string};

    if(!message) return res.status(400).json({error: "no message sent"}); 

    try{
        const session= await getOrCreateSession(session_id);

        const aiResponse = await ask(message, session.session_id);
        return res.json({
            response: aiResponse,
            session_id: session.session_id
        });

    }catch (error){
        console.error("Error processing message:", error);
        res.status(500).json({error: "Internal server error"});
    }
});

app.listen(PORT, () =>{
    console.log(`Server running on ${PORT}`);
});