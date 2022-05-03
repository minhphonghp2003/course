import express from "express";
import cor from 'cors'
import mainctrl from '../controller/main.js'
import checkauth from '../middleware/checkauth.js'


let route = express.Router()
const mainroute = (app)=>{
    route.get("/",mainctrl.mainView)
    route.post("/login",mainctrl.loginView)
    route.post("/register",mainctrl.regView)
    route.post("/logout",mainctrl.logoutView)
    return app.use("/",cor({origin:'*'}),route)
}

export default {mainroute}