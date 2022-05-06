import { pool } from '../model/auth.js'
import fs from 'fs'

const profileView = async (req, res) => {
    try {
        let { ID, ROLE } = req.data
        var [rows] = await pool.execute('select * from user JOIN vallet on user.id = vallet.user_id where id = ?', [ID])
        let info = rows[0]
        var [rows] = await pool.execute('select NAME as PARTY,DATE_JOINED, party.id as P_ID from user LEFT JOIN party_join ON user.id = party_join.member JOIN party ON party_join.PARTY = party.ID where user.id = ? ', [ID])
        
        let img = fs.readFileSync(info.IMAGE)

        let data = {"ROLE":ROLE,...info, ...rows, "IMAGE": img }
        res.status(200).json(data)
    } catch (error) {
        console.log(error);
    }

}

const enrolledView = async (req, res) => {
    try {
        let { ID } = req.data

        let [rows] = await pool.execute("SELECT id, name, difficulty,date_enrolled, prog FROM course INNER JOIN enrolled ON course.ID = enrolled.course where enrolled.learner =?", [ID])

        res.status(200).json(rows)
    } catch (error) {
        console.log("Error occured: ", error);
    }
}

const mycourseView = async (req, res) => {
    try {
        let { ID } = req.data
        let [rows] = await pool.execute("select id,name,date_added,cate from course where mentor = ?", [ID])
        res.status(200).json(rows)
    } catch (error) {
        console.log(error);
    }

}

const u_detailView = async (req, res) => {
    try {
        let id = req.params.id

        let [rows] = await pool.query("select * from user join auth on user.id = auth.id where user.id = ? ", [id])
        let img = fs.readFileSync(rows[0].IMAGE)

        let data = { ...rows[0], "IMAGE": img }
        res.status(200).json(data)
    } catch (error) {
        res.status(200).json(error)
    }
}

const updateProfile = async (req, res) => {
    try {
        let { ID } = req.data
        let img = req.file.destination + req.file.filename 

       
        let { f_name, l_name, phone, email, address } = req.body
        let full_name = f_name + ' ' + l_name


        await pool.execute("UPDATE user SET first_name = ?, last_name = ?,phone = ?,email = ?,address = ?,full_name = ?,image =? WHERE id = ?;", [f_name, l_name, phone, email, address, full_name, img, ID])
        res.status(200).json("DONE")
    } catch (error) {
        res.status(400).json({error:error})
    }
}

const updateVallet = async (req, res) => {
    try {
        let { ID } = req.data
        let { action, amount } = req.body
        if (action === 'deposit') {
            await pool.execute("UPDATE vallet SET balance = balance + ? WHERE user_id = ?", [amount, ID])
            res.status(200).json("DONE")
        }
        let { user_id } = req.body

        if (action === 'giveaway') {
            let [rows] = await pool.execute("select id from user where id = ?", [user_id])
            let user = rows[0].id
            await pool.execute("UPDATE vallet SET balance = balance - ? WHERE user_id = ?", [amount, ID])
            await pool.execute("UPDATE vallet SET balance = balance + ? WHERE user_id = ?", [amount, user])
        }

        res.status(200).json("DONE")
    }

    catch (error) {
        res.status(400).json(error)
    }

}

export default { profileView, enrolledView, mycourseView, u_detailView, updateProfile, updateVallet }