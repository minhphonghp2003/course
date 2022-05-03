import express from "express";
import morgan from "morgan";
import 'dotenv/config'
import route from './routes/main.js'

// ---------------------------------------------------------
const app = express()
const port = process.env.PORT

// ---------------------------------------------------------
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// route -------------------------------------------
route.mainroute(app)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({error:'Something went wrong!'})
})
// ---------------------------------------------------------
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})