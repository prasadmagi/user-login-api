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

app.post("/deleteUser", async (req, res) => {
  const { name, password } = req.body
  try {
    const findUser = await Users.findOne({ name });
    if (findUser && (await bcrypt.compare(password, findUser.password))) {
      await findUser.remove()
      return res.status(200).json({ message: "User deleted successfully", msgId: 0 })
    } else {
      return res.status(200).json({ message: "User Not Found", msgId: -1 })
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error", msgId: -1 })
  }
})
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
app.post("/changePassword", async (req, res) => {

  const { name, oldpassword, newpassword } = req.body
  const finduser = await Users.findOne({ name })

  try {
    if (!(name && oldpassword && newpassword)) {
      return res.status(200).json({ message: "Please provide all values..!" })
    }
    if (!finduser) {
      return res.status(200).json({ message: "User Not Found", msgId: -1 })
    }

    if (await (bcrypt.compare(oldpassword, finduser.password))) {

      if (await (bcrypt.compare(newpassword, finduser.password))) {
        return res.status(200).json({ message: "Newpassword cannot same as Oldpassword", msgId: -1 })
      }
      // return res.status(200).json({ message: finduser._id })
      let securednewpassword = await bcrypt.hash(newpassword, 10)
      let newUser = await Users.findByIdAndUpdate(finduser._id, { password: securednewpassword })

      await newUser.save()

      if (newUser) {
        return res.status(200).json({ message: "Password changes successfully", msgId: 0 })
      } else {
        return res.status(200).json({ message: "Password not change", msgId: -1 })
      }
    } else {
      return res.status(200).json({ message: "Oldpassword not matched", msgId: -1 })
    }

  } catch (err) {
    res.status(500).json({ message: "Internal server error", msgId: -1 })
  }
})
app.post("/changeUserName", async (req, res) => {
  const { oldname, newname, password } = req.body
  const finduser = await Users.find({ oldname })

  try {
    if (!(oldname && newname && password)) {
      return res.status(200).json({ message: "Please provide all values..!" })
    }
    if (!finduser) {
      return res.status(200).json({ message: "User Not Found", msgId: -1 })
    }

    if (await (bcrypt.compare(password, finduser.password))) {

      if (oldname === await (finduser.name)) {
        return res.status(200).json({ message: "newusername cannot same as oldusername", msgId: -1 })
      }


      let newUser = await Users.findByIdAndUpdate(finduser._id, { name: newname })

      await newUser.save()

      if (newUser) {
        return res.status(200).json({ message: "Username changes successfully", msgId: 0 })
      } else {
        return res.status(200).json({ message: "Username not change", msgId: -1 })
      }
    } else {
      return res.status(200).json({ message: "Oldpassword not matched", msgId: -1 })
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error", msgId: -1 })
  }
})
app.post("/deleteUser", async (req, res) => {
  const { name, password } = req.body
  const findUser = await Users.findOne({ name })
  try {
    if (!(name && password)) {
      return res.status(200).json({ message: "Please provide all values..!", msgId: -1 })
    }
    if (!findUser) {
      return res.status(200).json({ message: "User Not Found", msgId: -1 })
    }

    if (findUser && (await bcrypt(password, findUser.password))) {
      // const deleteUser = await Users.findOneAndRemove(findUser._id)

      let deleteUser = await Users.deleteMany({ name: name })

      if (deleteUser) {
        return res.status(200).json({ message: "User Deleted Successfully", msgId: -1 })
      } else {
        return res.status(200).json({ message: "User Not Deleted", msgId: -1 })
      }
    } else {
      return res.status(200).json({ message: "Password Not Matched", msgId: -1 })
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error", msgId: -1 })
  }
})
app.get("/", (req, res) => {
  res.json({ message: "Welcome to User Authentication App", msgId: 0 });
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});
