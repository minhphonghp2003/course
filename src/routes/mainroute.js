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
    let folder = file.fieldname +'/'
    cb(null, 'src/media/' +folder)
  },
  filename: function (req, file, cb) {
    
    cb(null, Math.round(Math.random() * 10000000) + '-' + file.originalname  )
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
    route.post("/crawler/",coursectrl.crawler)
    route.get("/party/",partyctrl.partyView )
    route.post("/upload/sin",upload.single('single'),mainctrl.uploadView)
    route.post("/upload/mul",upload.array('multiple',10),mainctrl.uploadView)
    return app.use("/",route)
}

const userroute = (app)=>{
    route.get("/myprofile",checkauth,userctrl.profileView)
    route.get("/u_detail/:id",userctrl.u_detailView)
    route.get("/enrolled",checkauth,userctrl.enrolledView)
    route.get("/mycourse",checkauth,userctrl.mycourseView)
    route.post("/u_update",checkauth,upload.single('profile'),userctrl.updateProfile)
    route.post("/vallet",checkauth,userctrl.updateVallet)
    route.post("/enroll",checkauth,userctrl.enrollCourse)
    route.get("/myvallet",checkauth,userctrl.myvalletView)

    return app.use("/user",cor({origin:'*'}),route)
}

const courseroute =(app)=>{
    route.get("/cate",coursectrl.cateView)
    route.get("/cate/:cate" , coursectrl.catedetailView)
    route.get("/c_detail/:id",coursectrl.coursedetailView)
    route.post("/new",checkauth,upload.single('course'),coursectrl.courseAdd)
    route.post("/c_update",checkauth,upload.single('course'),coursectrl.courseUpdate)
    route.post("/c_delete",checkauth,coursectrl.courseDelete)
    route.post("/rate/",checkauth,coursectrl.courseRate)
    route.post("/review",checkauth, coursectrl.reviewAdd)
    route.delete('/review/delete', checkauth,coursectrl.reviewDel)

    return app.use("/course",route)
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