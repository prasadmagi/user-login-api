const connectDB = require("./config/db");
const Users = require("./models/user");
const UsersData = require("./models/userdata");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const PORT = process.env.PORT || 4000;
// const PORT = 4000;
const app = express();
const bodyParser = require("body-parser");
const router = require("./routes/userRoutes");
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use("/user/api", router)
connectDB();












app.get("/getData", async (req, res) => {
  const { name } = req.body;
  const findUser = await Users.find({ name });
  const userdata = await UsersData.find({ name });
  if (userdata) {
    res.status(200).json({ data: userdata });
  } else {
    res.status(200).json({ msg: "No Data Found" });
  }
});
app.post("/sendData", async (req, res) => {
  const { name, data } = req.body;
  const findUser = await UsersData.find({ name });
  // try {
  //   if(findUser) {
  //     let UpdatedData = await UsersData.findOneAndUpdate(name,{data:data})

  //     if(UpdatedData) {
  //       res.status(200).json({message:"Data Updated", msgId:0})
  //     }else {
  //       res.status(200).json({message:"Data not updated", msgId:-1})
  //     }
  //   }else {
  //     let newData = new UsersData({
  //       name:name,
  //       data:data
  //     })

  //     await newData.save()

  //     if(newData) {
  //       res.status(200).json({message:"Data Added", msgId:0})
  //     }else {
  //       res.status(200).json({message:"Data not Added", msgId:-1})
  //     }
  //   }
  // }catch(err) {
  //   console.log(err);
  //   res.status(500).json({message:"Internal Server Error", msgId:-1})
  // }
  //newcode

  try {
    let findData = await UsersData.findOne({ name: findUser._id });
    if (findData) {
      // return res.status(200).json({ message: "Data present alrady" });
      let updateData = await UsersData.findByIdAndUpdate(findUser._id, {
        _id: findUser._id,
        name: name,
        data: data,
      });

      if (updateData) {
        await updateData.save();
        return res
          .status(200)
          .json({ message: "Data Updated Successfully", msgId: 0 });
      } else {
        return res.status(200).json({ message: "Data Not Updated", msgId: -1 });
      }
    } else {
      let newData = new UsersData({
        _id: findUser._id,
        name: name,
        data: data,
      });
      if (newData) {
        await newData.save();
        return res
          .status(200)
          .json({ message: "Data saved successfully", msgId: 0 });
      } else {
        return res.status(200).json({ message: "Data Not Added", msgId: -1 });
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", msgId: -1 });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});
