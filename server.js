const connectDB = require("./config/db");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const PORT = process.env.PORT || 4000;
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

app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});
