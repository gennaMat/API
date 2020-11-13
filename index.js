const express = require("express");
const app = express();
const importData =require("app.js");


let port = process.env.PORT || 3000;


app.get("/", (req, res)=>{
    res.send("Hello World")

})

app.listen(port, ()=>{

    console.log(`Project 2 API is listening on ${port}`)
})