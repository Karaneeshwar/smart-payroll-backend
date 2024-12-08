const expr = require('express');
const app = expr();
const mysql = require('mysql');
const cors = require('cors');
const fs = require('fs');
const path = require('path')
const busboy = require('busboy')

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
    console.log(id);
    console.log(pwd);
    const sql = 'select password from employees where id = '+id;
    db.query(sql, (err, data) => {
        if (err){
            console.log(err);
            res.status(500).json({error:"Failed to retrieve", details:err.message});
        } else {
            console.log(data[0].password);
            if (pwd===data[0].password){
                console.log("Matches");
                res.status(200).send("Yes");
            } else {
                console.log("not a match");
                res.send("No");
            }
            
        }
    });
});

app.get('/putAttendance', (req, res) => {
    const id = req.query.id;
    const sql = "insert into attendance (empid, record) values ("+id+", 'P')"
    console.log(id);
    console.log(sql);
    db.query(sql, (err, data) => {
        if (err) {
            console.log(err.sqlMessage);
            if (err.sqlMessage.slice(0,15)==="Duplicate entry"){
                res.send("Yes");
            } else {
                res.send(err.sqlMessage);
            }
        } else {
            res.send("Yes");
        }
    });
});

app.get('/getloc', (req, res) => {
    const id = req.query.loc;
    console.log(id);
    const sql = "select locationStr from locations where id = "+id;
    db.query(sql, (err, data) => {
        if (err){
            console.error(err.sqlMessage);
            res.status(500).json({message:"failed to retrieve"});
        } else {
            console.log("Retrieved successfully!!");
            res.status(200).json(data[0].locationStr);
        }
    });
});

app.get('/users/img', (req,res) => {
    const id = req.query.id;
    console.log(typeof id);
    res.sendFile("F:/Projects/gcsprs/node-back/profiles/" + id +".jpg");
});

function insertEmployees(data){
    console.log(data);
    const sql = 'insert into employees (id, name, loc_id, password) values ('+data.empid+', "'+data.name+'", '+data.locid+', "'+data.pwd+'")';
    db.query(sql, (err, data) => {
        if (err){
            console.error("Insert Error: "+err.sqlMessage);
            return "No"+err.sqlMessage;
        } else {
            console.log("Insertion successful");
            return "Yes";
        }
    });
};

app.post('/addusers', (req, res) => {
    const bb = busboy({ headers: req.headers });
    var data = {};
    bb.on("field", (name, value, info) => {
        data[name] = value;
        console.log(name+'\t'+value);
    });
    
    bb.on("file", (name, file, info) => {
        console.log("file:"+name);
        const { filename } = info;
        console.log(filename);
        const des = path.join(__dirname, "profiles", filename);
        console.log("fpath: "+des);
        file.pipe(fs.createWriteStream(des));
        console.log("File successfully written!!");
    });
    bb.on("finish", () => {
        console.log("Form handled successfully");
        const insRes = insertEmployees(data);
        res.status(200).send("Yes");
    });
    bb.on("error", (err) => {
        console.log(err.message);
        res.send("No");
    });
    req.pipe(bb);
    
});

app.listen(3000, ()=>{
    console.log("Backend runnning at 3000");
});