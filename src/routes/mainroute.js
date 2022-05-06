import express from "express";
import cor from 'cors'
import mainctrl from '../controller/mainctrl.js'
import userctrl from '../controller/userctrl.js'
import coursectrl from '../controller/coursectrl.js'
import partyctrl from '../controller/partyctrl.js'
import checkauth from '../middleware/checkauth.js'
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/media/')
  },
  filename: function (req, file, cb) {
    
    cb(null, file.fieldname+ '-' + Math.round(Math.random() * 10000000) + '-' + file.originalname  )
  }
})

let upload = multer({
    storage: storage,
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(png|jpg|pdf|docx|mov)$/)) {
            // upload only png and jpg format
            return cb(new Error('Please upload a file'), false)
        }
        cb(undefined, true)
    }
})

// ----------------------------------------------------------

let route = express.Router()
const mainroute = (app)=>{
    route.get("/",mainctrl.mainView)
    route.post("/login/",mainctrl.loginView)
    route.post("/register/",mainctrl.regView)
    route.get("/course/",coursectrl.courseView )
    route.get("/party/",partyctrl.partyView )
    route.post("/upload/sin",upload.single('single'),mainctrl.uploadView)
    route.post("/upload/mul",upload.array('multiple',10),mainctrl.uploadView)
    return app.use("/",cor({origin:'*'}),route)
}

const userroute = (app)=>{
    route.get("/myprofile",checkauth,userctrl.profileView)
    route.get("/u_detail/:id",userctrl.u_detailView)
    route.get("/enrolled",checkauth,userctrl.enrolledView)
    route.get("/mycourse",checkauth,userctrl.mycourseView)
    route.post("/update",checkauth,upload.single('single'),userctrl.updateProfile)
    route.post("/vallet",checkauth,userctrl.updateVallet)

    return app.use("/user",cor({origin:'*'}),route)
}

const courseroute =(app)=>{
    route.get("/cate",coursectrl.cateView)
    route.get("/cate/:cate" , coursectrl.catedetailView)
    route.get("/c_detail/:id",coursectrl.coursedetailView)

    return app.use("/course",cor({origin:'*'}),route)
}

const partyroute =(app)=>{
    route.get("/p_detail/:id",partyctrl.p_detailView)
    route.post("/join/:id",checkauth,partyctrl.joinParty)
    route.post("/leave/:id",checkauth,partyctrl.leaveParty)
    route.post("/create",checkauth,partyctrl.createParty)
    route.post("/modify/:id",checkauth,partyctrl.updateParty)

    return app.use("/party",cor({origin:'*'}),route)
}

export default {mainroute,userroute,courseroute,partyroute}