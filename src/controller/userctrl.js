import { pool } from '../model/auth.js'
import fs from 'fs'
import bcrypt from 'bcrypt'

const profileView = async (req, res) => {
    try {
        let { ID, ROLE } = req.data
        var [rows] = await pool.execute('select * from user JOIN vallet on user.id = vallet.user_id JOIN auth ON user.id = auth.id where user.id = ?', [ID])
        let info = rows[0]
        var [rows] = await pool.execute('select NAME as PARTY,DATE_JOINED, party.id as P_ID from user LEFT JOIN party_join ON user.id = party_join.member JOIN party ON party_join.PARTY = party.ID where user.id = ? ', [ID])

        let img = fs.readFileSync(info.IMAGE)

        let data = { "ROLE": ROLE, ...info, ...rows, "IMAGE": img }
        return res.status(200).json(data)
    } catch (error) {
        return res.status(500).json({ error: error })
    }

}

const enrolledView = async (req, res) => {
    try {
        let { ID } = req.data

        let [rows] = await pool.execute("SELECT id, name, difficulty,date_enrolled, prog FROM course INNER JOIN enrolled ON course.ID = enrolled.course where enrolled.learner =?", [ID])

        return res.status(200).json(rows)
    } catch (error) {
        return res.status(500).json({ error: error })
    }
}

const enrollCourse = async (req, res) => {
    try {
        let { ID } = req.data
        let { c_id } = req.body
        await pool.execute("insert into enrolled (learner,course) values(?,?)", [ID, c_id])
        var [rows] = await pool.execute("select price,mentor from course where id = ?", [c_id])
        let { price, mentor } = rows[0]
        var [rows] = await pool.execute("select * from vallet where user_id = ? ", [ID])
        let learner_bal = rows[0].BALANCE
        if (learner_bal < price) {
            await pool.execute("delete from enrolled where learner = ?", [ID])
            return res.status(400).json("Not enough money")
        }
        await pool.execute("update vallet set balance = balance - ? where user_id = ? ", [price, ID])
        await pool.execute("update vallet set balance = balance + ? where user_id = ? ", [price, mentor])
        return res.status(200).json("DONE")
    } catch (error) {
        return res.status(400).json({ "error": error });
    }
}

const mycourseView = async (req, res) => {
    try {
        let { ID } = req.data
        let [rows] = await pool.execute("select * from course where mentor = ?", [ID])
        return res.status(200).json(rows)
    } catch (error) {

        return res.status(500).json({ error: error })
    }

}

const u_detailView = async (req, res) => {
    try {
        let id = req.params.id

        let [rows] = await pool.query("select * from user join auth on user.id = auth.id where user.id = ? ", [id])
        let img = fs.readFileSync(rows[0].IMAGE)

        let data = { ...rows[0], "IMAGE": img }
        delete data.PASSWD
        return res.status(200).json(data)
    } catch (error) {
        return res.status(404).json(error)
    }
}

const updateProfile = async (req, res) => {
    try {
        let { ID } = req.data
        let img = req.file.destination + req.file.filename

        let { f_name, l_name, phone, email, address, passwd } = req.body
        let full_name = f_name + ' ' + l_name

        let hash = await bcrypt.hash(passwd, 10)

        await pool.execute("UPDATE user SET first_name = ?, last_name = ?,phone = ?,email = ?,address = ?,full_name = ?,image =? WHERE user.id = ?", [f_name, l_name, phone, email, address, full_name, img, ID])
        await pool.execute("UPDATE auth set passwd = ? where id = ?", [hash, ID])
        return res.status(200).json("DONE")
    } catch (error) {
        return res.status(500).json({ error: error })
    }
}

const updateVallet = async (req, res) => {
    let { ID } = req.data
    let { action, amount, user_id } = req.body
    try {

        if (action === 'deposit') {
            await pool.execute("UPDATE vallet SET balance = balance + ? WHERE user_id = ?", [amount, ID])
            return res.status(200).json("DONE")
        }


        if (action === 'giveaway') {

            let [rows] = await pool.execute("select id, balance from user  JOIN vallet ON user.id = vallet.user_id where id = ? UNION ALL select id,balance from user JOIN vallet ON user.id = vallet.user_id where user.id = ?", [user_id, ID])

            let beneficiary = rows[0].id
            let sender_bal = rows[1].balance
            if (sender_bal < amount) {
                return res.status(400).json("NOT ENOUGH MONEY")
            }
            await pool.execute("UPDATE vallet SET balance = balance - ? WHERE user_id = ?", [amount, ID])
            await pool.execute("UPDATE vallet SET balance = balance + ? WHERE user_id = ?", [amount, beneficiary])
            return res.status(200).json("DONE")
        }

    }

    catch (error) {
        res.status(500).json(error)
    }

}

const myvalletView =async (req, res) => {
    try {
        let {ID} = req.data
        var [rows] =await pool.execute("select * from vallet where user_id = ?",[ID])
        let user_vallet = rows[0]
        var [rows] = await pool.execute("select id,full_name from user as u1 where not exists (select * from user as u2 where u1.id = u2.id and id = ?)",[ID])
        let beneficiary = rows
        return res.status(200).json({...user_vallet,...beneficiary})
    } catch (error) {
        return res.status(500).json({ error: error })
    }
}

export default { profileView, enrolledView, mycourseView, u_detailView, updateProfile, updateVallet, enrollCourse, myvalletView }