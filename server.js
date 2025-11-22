import express from 'express';

const app=express();
const PORT=3000;


app.use(express.json());

app.get('/', (req, res) =>{
    res.json({
        message: "Server is up and running"
    });
});

app.listen(PORT, () =>{
    console.log(`Server running on ${PORT}`);
})