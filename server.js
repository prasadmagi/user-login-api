const connectDB = require("./config/db");
const Users = require("./models/user");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
const PORT = 4000;
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
connectDB();
app.post("/createUser", async (req, res) => {
  // const name = req.body.name

  const { name, password } = req.body;

  if (!(name && password)) {
    res.status(404).send("Please provide all value");
    return;
  }

  let users;
  let securedpassword = await bcrypt.hash(password, 10);

  // console.log(securedpassword, "checkpassword");

  try {
    const find = await Users.findOne({ name });
    if (find) {
      return res.status(404).send("User Already Present");
    }
    users = new Users({
      name,
      password: securedpassword,
    });

    await users.save();
  } catch (err) {
    res.status(500).send("Internal Server Error");
    console.log(err);
    return;
  }

  if (users) {
    console.log(token);
    res.status(201).send("User created successfully");
    return;
  } else {
    res.status(404).send("User not created");
    return;
  }
});

app.post("/loginUser", async (req, res) => {
  const { name, password } = req.body;
  const key = process.env.Secreat_Key;

 
  try {
    const findUser = await Users.findOne({ name });
    
   
    const paylod = {
        name: findUser.name,
        password: findUser.password,
      };


      const token = jwt.sign(paylod, key, { expiresIn: "2d" });
      console.log(token);
    if (findUser && (await bcrypt.compare(password,findUser.password))) {
      res.status(200).json({
        msg: "User login Successfully",
        token: token,
      });
    } else {
      res.status(404).send("User login failed");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/alluser", async (req, res) => {
  let users;

  try {
    users = await Users.find();
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }

  if (users) {
    res.status(200).send(users);
  } else {
    res.status(404).send("User not fetched");
  }
});
app.get("/protect",async(req, res)=>{
    const token  = req.headers.auth
    const key = process.env.Secreat_Key;
    try {
        const decode = jwt.verify(token, key);

        const name = decode.name

        const user = await Users.findOne({name})

        if(user) {
            res.json({msg:`Welcome user ${user.name}! and note this is proctected route`})
        }else {
            res.status(401).send("Invalid token")
        }
    } catch(err) {
        console.log(err);
        res.status(404).send("Invalid token")
    }
})
app.get("/home", (req, res) => {
  res.end("Home page");
});

app.listen(PORT, () => {
  console.log("Server is running");
});
