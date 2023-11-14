const connectDB = require("./config/db");
const Users = require("./models/user");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors")
const PORT = process.env.PORT || 4000;
// const PORT = 4000;
const app = express();
const bodyParser = require("body-parser");
app.use(cors())
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
connectDB();
app.get("/logout", (req, res) => {
  try {

    let cookie = req.cookies.authcookie
    console.log(cookie, "cookie");
    if (cookie) {

      res.clearCookie("authcookie");
      return res.status(200).json({ message: "User logout succesfully", msgId: 0 });
    } else {
      return res.status(200).json({ message: "Please Login first", msgId: 0 })
    }

  } catch (err) {
    console.log(err);
  }
});
app.post("/createUser", async (req, res) => {


  const { name, password, role } = req.body;

  if (!(name && password)) {
    res.status(404).send("Please provide all value");
    return;
  }


  if (typeof (role) !== "boolean") {

    return res.status(400).send("Please provide proper value for role !")
  }
  let users;
  let securedpassword = await bcrypt.hash(password, 10);



  try {
    const find = await Users.findOne({ name });
    if (find) {
      return res.status(200).json({ message: "User Already Present", msgId: -1 });
    }
    users = new Users({
      name,
      password: securedpassword,
      role: role
    });

    await users.save();
  } catch (err) {
    res.status(500).send("Internal Server Error");
    console.log(err);
    return;
  }

  if (users) {
    if (role) {

      return res.status(201).json({ message: "Admin User created successfully", msgId: 0 });
    } else {

      return res.status(201).json({ message: "User created successfully", msgId: 0 });
    }
  } else {
    return res.status(404).json({ message: "User not created", msgId: -1 });
  }
});

app.post("/loginUser", async (req, res) => {
  const { name, password } = req.body;
  const key = process.env.Secreat_Key;
  let cookie = req.cookies.authcookie
  try {
    const findUser = await Users.findOne({ name });

    const paylod = {
      name: findUser.name,
      password: findUser.password,
    };

    console.log(cookie, "cookie");
    if (cookie) {
      return res.status(200).json({ message: "User Already login", msgId: 0 })
    }


    if (findUser && (await bcrypt.compare(password, findUser.password))) {
      const token = jwt.sign(paylod, key, { expiresIn: "2d" });
      res.cookie("authcookie", token, { maxAge: 900000, httpOnly: true });
      return res.status(200).json({
        message: "User login Successfully",
        msgId: 0,
        token: token,
      });
    } else {
      res.status(200).json({ message: "User login failed", msgId: -1 });
      return
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
    return
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
    res.status(200).json({ message: "User are as follow", user: users, msgId: 0 });
  } else {
    res.status(200).json({ message: "User not fetched", msgId: 0 });
  }
});

app.get("/protect", async (req, res) => {

  const token = req.cookies.authcookie;
  const key = process.env.Secreat_Key;
  try {
    const decode = jwt.verify(token, key);

    const name = decode.name;

    const user = await Users.findOne({ name });

    if (user) {
      res.json({
        msg: `Welcome user ${user.name}! and note this is proctected route`,
      });
    } else {
      res.status(403).send("UnAuthorzed User");
    }
  } catch (err) {
    console.log(err);
    res.status(404).send("Invalid token");
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to User Authentication App", msgId: 0 });
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});
