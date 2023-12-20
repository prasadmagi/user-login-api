const express = require("express")
const router = express.Router()
const UserController = require("../controller/userController")


router.get("/", UserController.main)
router.post("/createUser", UserController.createUser)
router.post("/loginUser", UserController.loginUser)
router.post("/deleteUser", UserController.deleteUser)
router.post("/changePassword", UserController.changePassword)
router.post("/changeUserName", UserController.changeUserName)
router.get("/logout", UserController.logout)
router.post("/protect", UserController.protect)
router.post("/allUser", UserController.allUser)
router.put("/sendUserData", UserController.sendUserData)
router.get("/getUserData", UserController.getUserData)

module.exports = router
