import jwt from 'jsonwebtoken'
import fs from 'fs'

const checkauth =(req,res,next)=>{
   
    let token = req.headers['token']
    let pub = fs.readFileSync("jwtRS256.pub")
    
    jwt.verify(token,pub,{ algorithm: 'RS256'},(err,payload)=>{
        if (err) {
            next(err)
        }
        req.data = payload
        next()
    })
}
export default checkauth