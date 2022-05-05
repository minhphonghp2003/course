import express from "express";
import morgan from "morgan";
import 'dotenv/config'
import route from './routes/mainroute.js'
import cookieParser from "cookie-parser";


// ---------------------------------------------------------
const app = express()
const port = process.env.PORT

// ---------------------------------------------------------
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())



// route -------------------------------------------
route.mainroute(app)
route.userroute(app)
route.courseroute(app)
route.partyroute(app)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({error:err})
})
// ---------------------------------------------------------
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})