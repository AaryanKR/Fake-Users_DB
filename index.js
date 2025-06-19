const { faker } = require('@faker-js/faker');
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const {v4 : uuidv4} = require("uuid");

let port = 8080;

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "/views"));

const connection = mysql.createConnection({
    host : "localhost",
    user : "root",
    database : "delta_app",
    password : "Pass@123"
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
};

//home route
app.get("/" , (req , res) => {
  let q = `select count(*) from user`;
  try{
      connection.query(q , (err , result) => {
      if(err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs" , {count});
    });
  }
  catch(err){
    console.log(err);
    res.send("some error in db");
  }
});

//show route
app.get("/user" , (req , res) => {
  let q = `select * from user`;
  try{
      connection.query(q , (err , users) => {
      if(err) throw err;
      res.render("showusers.ejs" , {users});
    });
  }
  catch(err){
    console.log(err);
    res.send("some error in db");
  }
});

//edit route
app.get("/user/:id/edit" , (req , res) => {
  let {id} = req.params;
  let q = `select * from user where id = '${id}'`;
  try{
      connection.query(q , (err , result) => {
      if(err) throw err;
      // res.send(result);
      let user = result[0];
      res.render("edit.ejs" , {user});
    });
  }
  catch(err){
    console.log(err);
    res.send("some error in db");
  }
});

//update db route
app.patch("/user/:id" , (req , res) => {
  let {id} = req.params;
  let {password : formPass , username : newUsername} = req.body;
  let q = `select * from user where id = '${id}'`;

  try{
      connection.query(q , (err , result) => {
      if(err) throw err;
      let user = result[0];
      if(formPass != user.password){
        res.send("wrong password");
      }
      else{
        q2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}'`;
        connection.query(q2 , (err , result) => {
          if(err) throw err;
          res.redirect("/user");
        });
      }
    });
  }
  catch(err){
    console.log(err);
    res.send("some error in db");
  }
})

//add user
app.get("/user/new" , (req , res) => {
  res.render("new.ejs");
});

app.post("/user/new" , (req , res) => {
  let {username , email , password} = req.body;
  let id = uuidv4();
  //query to insert new values
  let q = `insert into user(id , username , email , password) values ('${id}' , '${username}' , '${email}' , '${password}')`;
  try{
      connection.query(q , (err , result) => {
      if(err) throw err;
      console.log("new user added");
      res.redirect("/user");
    });
  }
  catch(err){
    res.send("some error in db");
  }
});

//delete user
app.get("/user/:id/delete" , (req , res) => {
  let {id} = req.params;
  let q = `select * from user where id = '${id}'`;
  try{
      connection.query(q , (err , result) => {
      if(err) throw err;
      let user = result[0];
      res.render("delete.ejs" , {user});
    });
  }
  catch(err){
    res.send("some error in db");
  }
});

app.delete("/user/:id/" , (req , res) => {
  let {id} = req.params;
  let {password} = req.body;
  let q = `select * from user where id = '${id}'`;
  try{
    connection.query(q , (err,result) => {
      if(err) throw err;
      let user = result[0];

      if(user.password != password){
        res.send("wrong password entered");
      }
      else{
        let q2 = `delete from user where id = '${id}'`;
        connection.query(q2 , (err,result) => {
          if(err) throw err;
          else{
            console.log("deleted.");
            res.redirect("/user");
          }
        });
      }
    });
  }
  catch(err){
    res.send("some error in db");
  }
});


app.listen(port , () => {
  console.log(`app is listening on port ${port}`);
});

// let q = "show tables";
// let q = "insert into user(id,username,email,password) values ?";        //inserting new data
// let data = [];
// for(let i=1;i<=100;i++){
//   data.push(getRandomUser());      //100 random users fake data
// }


// // let users = [["123abcb","abcabcb","abc@gmail.comb","abc123b"],
// //             ["123abcc","abcabcc","abc@gmail.comc","abc123c"]];

