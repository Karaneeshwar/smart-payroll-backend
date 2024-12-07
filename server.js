const expr = require('express');
const app = expr();
const mysql = require('mysql');
const cors = require('cors');

app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "employeerecords"
});

app.get('/users/login', (req,res) => {
    const id = req.query.id;
    const pwd = req.query.pwd;
    const sql = 'select password from employees where id = '+id;
    db.query(sql, (err, data) => {
        if (err){
            console.log(err);
            res.status(500).json({error:"Failed to retrieve", details:err.message});
        } else {
            if (pwd===data[0].password){
                console.log("Matches");
            }
            res.status(200).send("Yes");
        }
    });
});

app.get('/users/img', (req,res) => {
    const id = req.query.id;
    res.sendFile('/profiles/'+id+'.jpg');
});

app.get('/users')

app.listen(3000, ()=>{
    console.log("Backend runnning at 3000");
});