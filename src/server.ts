import express from 'express';
import askAI from '../utils/askAI.ts';

const app=express();
const PORT=3000;


app.use(express.json());

app.get('/', (req, res) =>{
    res.json({
        message: "Server is up and running"
    });
});

app.post('/chat', async (req, res)=>{
    const {message} =req.body;

    if(!message) return res.json({error: "no message sent"}); 

    try{
        const aiResponse = await askAI(message);
        return res.json({response: aiResponse});
    }catch (error){
        console.error("Error processing message:", error);
        res.status(500).json({error: "Internal server error"});
    }
});

app.listen(PORT, () =>{
    console.log(`Server running on ${PORT}`);
});