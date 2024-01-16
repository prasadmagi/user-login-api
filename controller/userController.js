const Users = require("../models/user");
const UsersData = require("../models/userdata");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const main = async (req, res) => {
  res.json({ message: "Welcome to User Authentication App", msgId: 0 });
};

const createUser = async (req, res) => {
  const { name, password, isAdmin } = req.body;

  if (!(name && password && isAdmin)) {
    res.status(404).send("Please provide all value");
    return;
  }

  if (isAdmin != "Yes" && isAdmin != "No") {
    return res.status(404).json({ message: "Please provide proper admin role! ...", msgId: -1 })
  }

  let users;
  let securedpassword = await bcrypt.hash(password, 10);

  try {
    const find = await Users.findOne({ name });
    if (find) {
      return res
        .status(200)
        .json({ message: "User Already Present", msgId: -1 });
    }
    users = new Users({
      name,
      password: securedpassword,
      isAdmin: isAdmin,
    });

    await users.save();
  } catch (err) {
    res.status(500).send("Internal Server Error");
    console.log(err);
    return;
  }

  if (users) {
    if (isAdmin === "Yes") {
      return res
        .status(201)
        .json({ message: "Admin User created successfully", msgId: 0 });
    } else {
      return res
        .status(201)
        .json({ message: "User created successfully", msgId: 0 });
    }
  } else {
    return res.status(404).json({ message: "User not created", msgId: -1 });
  }
};

const loginUser = async (req, res) => {
  const { name, password } = req.body;
  const key = process.env.Secreat_Key;
  let cookie = req.cookies.authcookie;
  try {
    const findUser = await Users.findOne({ name });
    if (!findUser) {
      return res.json({ message: "User Not Found", msgId: -1 });
    }
    const paylod = {
      name: findUser.name,
      password: findUser.password,
    };


    if (cookie) {
      return res.status(200).json({ message: "User Already login", msgId: 0 });
    }

    if (findUser && (await bcrypt.compare(password, findUser.password))) {
      const token = jwt.sign(paylod, key, { expiresIn: "100d" });
      const isAdmin = findUser.isAdmin
      console.log(isAdmin, "isAdmin");
      console.log("token", typeof (token));
      //logic for isActive
      await Users.findByIdAndUpdate(findUser._id, { isActive: true, token: token }, { new: true })
      // await ActiveUser.save()
      res.cookie("authcookie", token, { maxAge: 90000000, httpOnly: true });
      return res.status(200).json({
        message: "User login Successfully",
        msgId: 0,
        isAdmin: isAdmin,
        token: token,
        user:name
      });

    } else {

      res.status(200).json({ message: "User login failed", msgId: -1 });
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
    return;
  }
};

const deleteUser = async (req, res) => {
  const { name, password } = req.body;
  const findUser = await Users.findOne({ name });
  try {
    if (!(name && password)) {
      return res
        .status(200)
        .json({ message: "Please provide all values..!", msgId: -1 });
    }
    if (findUser && (await bcrypt.compare(password, findUser.password))) {
      Users.deleteOne({ name: findUser.name })
        .then(function () {
          return res
            .status(200)
            .json({ message: "User deleted Successfully", msgId: 0 });
        })
        .catch((err) => {
          return res
            .status(200)
            .json({ message: "User not deleted", msgId: -1 });
        });
    } else {
      return res.status(200).json({ message: "User Not Found", msgId: -1 });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", msgId: -1 });
  }
};

const changePassword = async (req, res) => {
  const { name, oldpassword, newpassword } = req.body;
  const finduser = await Users.findOne({ name });

  try {
    if (!(name && oldpassword && newpassword)) {
      return res.status(200).json({ message: "Please provide all values..!" });
    }
    if (!finduser) {
      return res.status(200).json({ message: "User Not Found", msgId: -1 });
    }

    if (await bcrypt.compare(oldpassword, finduser.password)) {
      if (await bcrypt.compare(newpassword, finduser.password)) {
        return res.status(200).json({
          message: "Newpassword cannot same as Oldpassword",
          msgId: -1,
        });
      }
      // return res.status(200).json({ message: finduser._id })
      let securednewpassword = await bcrypt.hash(newpassword, 10);
      let newUser = await Users.findByIdAndUpdate(finduser._id, {
        password: securednewpassword,
      });

      await newUser.save();

      if (newUser) {
        return res
          .status(200)
          .json({ message: "Password changes successfully", msgId: 0 });
      } else {
        return res
          .status(200)
          .json({ message: "Password not change", msgId: -1 });
      }
    } else {
      return res
        .status(200)
        .json({ message: "Oldpassword not matched", msgId: -1 });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error", msgId: -1 });
  }
};

const changeUserName = async (req, res) => {
  const { oldname, newname, password } = req.body;
  const finduser = await Users.findOne({ name: oldname });

  try {
    if (!(oldname && newname && password)) {
      return res.status(200).json({ message: "Please provide all values..!" });
    }
    if (!finduser) {
      return res.status(200).json({ message: "User Not Found", msgId: -1 });
    }

    if (finduser && (await bcrypt.compare(password, finduser.password))) {
      if (newname === (await finduser.name)) {
        return res.status(200).json({
          message: "newusername cannot same as oldusername",
          msgId: -1,
        });
      }

      let newUser = await Users.findByIdAndUpdate(finduser._id, {
        name: newname,
      });

      await newUser.save();

      if (newUser) {
        return res
          .status(200)
          .json({ message: "Username changes successfully", msgId: 0 });
      } else {
        return res
          .status(200)
          .json({ message: "Username not change", msgId: -1 });
      }
    } else {
      return res
        .status(200)
        .json({ message: "Oldpassword not matched", msgId: -1 });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error", msgId: -1 });
  }
};

const logout = async (req, res) => {
  let cookie = req.cookies.authcookie;
  try {

    if (!cookie) {
      return res.status(200).json({ message: "Please Login First", msgId: -1 })
    }

    let findUser = await Users.find({ token: cookie })
    // let findUser1 = await Users.find({name:findUser.name})

    if (findUser) {
      let userId = await findUser[0]._id
      await Users.findByIdAndUpdate(userId, { isActive: false }, { new: true })
      await Users.findByIdAndUpdate(userId, { token: "" }, { new: true })
      res.clearCookie("authcookie");
      return res.status(200).json({ message: "User Logout Successfully", msgId: 0 })
    } else {
      return res.status(200).json({ message: "User Not Found", msgId: -1 })

    }
    // if (cookie) {
    //   return res
    //     .status(200)
    //     .json({ message: "User logout succesfully", msgId: 0 });
    // } else {
    //   return res.status(200).json({ message: "Please Login first", msgId: 0 });
    // }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error", msgId: -1 })
  }
};

const protect = async (req, res) => {
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
};

const allUser = async (req, res) => {
  let users;

  try {
    users = await Users.find();
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }

  if (users) {
    res
      .status(200)
      .json({ message: "User are as follow", user: users, msgId: 0 });
  } else {
    res.status(200).json({ message: "User not fetched", msgId: 0 });
  }
};


const sendUserData = async (req, res) => {

  const { name, data } = req.body;
  const finduser = await Users.findOne({ name: name });
  try {
    if (!finduser) {
      return res.status(200).json({ message: "User Not Found", msgId: -1 });
    } else {
      const id = await finduser.user_id;
      const finduserid = await UsersData.findOne({ id });
      let user_id = await finduser._id;
      let userdata = await UsersData.findOne({ user_id: user_id });

      if (userdata) {
        const _finduserid = await finduserid._id;
        try {
          let updateduserdata = await UsersData.findByIdAndUpdate(
            _finduserid,
            {
              _id: _finduserid,
              data: data,
            },
            { new: true }
          );

          if (updateduserdata) {
            return res.status(200).json({ message: "User Data Updated Succsessfully", msgId: 0 });
          } else {
            return res.status(200).json({ message: "User Data Not Updated", msgId: -1 });
          }
        } catch (error) {
          console.log(error, "error");
          return res.status(500).json({ message: "Internal Server Error", msgId: -1 })
        }
      } else {
        let newUserData = new UsersData({
          user_id: user_id,
          data: data,
        });
        await newUserData.save();
        return res.status(200).json({ message: "User Data Created Successfully", msgId: -0 });
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "INternal Server error", msgId: -1 });
  }
};



const getUserData = async (req, res) => {
  const { name } = req.body
  const findUser = await Users.findOne({ name: name })
  console.log(findUser, "finduser");
  try {
    if (findUser) {
      let userId = await findUser._id
      let findUserData = await UsersData.find({ user_id: userId }).select("data")

      console.log(findUserData, "CHECK");
      if (findUserData) {
        return res.status(200).json({ data: findUserData })
      } else {
        return res.status(200).json({ message: "User Data Not Found", msgId: -1 })
      }
    } else {

      return res.status(200).json({ message: "User Not Found", msgId: -1 })
    }
  } catch (err) {
    console.log(err, "Error");
    return res.status(500).json({ message: "Internal Server Error", msgId: -1 })
  }
}
exports.main = main;
exports.createUser = createUser;
exports.loginUser = loginUser;
exports.deleteUser = deleteUser;
exports.changePassword = changePassword;
exports.changeUserName = changeUserName;
exports.logout = logout;
exports.protect = protect;
exports.allUser = allUser;
exports.sendUserData = sendUserData;
exports.getUserData = getUserData;
