import jwt from 'jsonwebtoken'
import { pool } from '../model/model.js'
import fs from 'fs'
import bcrypt from 'bcrypt'

// --------------------------------------------------------------------


const mainView = async (req, res) => {
    let token = req.headers['token']

    if (token) {
        let pub = fs.readFileSync('jwtRS256.pub')
        jwt.verify(token, pub, { algorithm: 'RSA256' }, async (err, payload) => {
            if (err) {
                return res.status(400).json({ error:"Please login again or logout."})
            }
            let [rows] = await pool.execute('select * from user JOIN vallet where user.id = ?', [payload.ID])

            let info = {...rows[0],...{"ROLE":payload.ROLE}}
            return res.status(200).json(info)
        })
    } else {
        return res.status(200).json({ "user": "Guest" })
    }

}
const loginView = async (req, res) => {
    try {
    
        let { username, passwd } = req.body

        let [rows] = await pool.execute('select * from auth where username = ?', [username])
        let cred = rows[0]
        let ID = cred.ID, ROLE = cred.ROLE

        if (!cred) {
            throw new Error()
        }
        let hash = cred.PASSWD
        let cmp = await bcrypt.compare(passwd, hash)
        if (!cmp) {
            throw new Error()
        }

        let priv = fs.readFileSync('jwtRS256.key')
        jwt.sign({ ID, ROLE }, priv, { expiresIn: '1d', algorithm: 'RS256' }, (err, payload) => {
            if (err) {
                return res.status(500).json({error:"error"})
            }
            
            return res.status(200).json(payload)
        })

    } catch (error) {

        return res.status(400).json({ error: "Invalid account" })
    }

}
const regView = async (req, res) => {
    let { fname, lname, username, passwd, role } = req.body
    try {
        let hash = await bcrypt.hash(passwd, 10)
        await pool.execute("INSERT INTO auth (username,passwd,role) VALUES (?,?,?)", [username, hash, role])
        let [rows] = await pool.execute("select * from auth where username = ?", [username])
        let { ID, ROLE } = rows[0]
        let full_name = fname + " " + lname
        let image = 'src/media/avt.png'
        await pool.execute("INSERT INTO user (id, first_name,last_name,full_name,image) VALUES (?,?,?,?,?)", [ID, fname, lname, full_name, image])
        await pool.execute("insert into vallet (user_id,balance) values (?,?)",[ID,0])
        // ----------------------------------------------------------------

        let priv = fs.readFileSync('jwtRS256.key')
        jwt.sign({ ID, ROLE }, priv, { expiresIn: '1d', algorithm: 'RS256' }, (err, payload) => {
            if (err) {
                return res.status(500).json("err")
            }
            // change here---------------------------------------------------------
           
             return res.status(200).json(payload)
        })

    } catch (err) {

        return res.status(400).json("Invalid username")
    }
}

const uploadView = (req, res) => {
    try {
        if (req.file) {

            return res.status(200).json(req.file)
        } else {

            return res.status(200).json(req.files)
        }
    } catch (error) {
        res.status(500).json(error)
    }

}

export default { mainView, loginView, regView, uploadView }