import { pool } from '../model/auth.js'
import jwt from 'jsonwebtoken'

const profileView = async (req, res) => {
    try {
        let { ID, ROLE } = req.data
        var [rows] = await pool.execute('select * from user JOIN vallet on user.id = vallet.user_id where id = ?', [ID])
        let info = rows[0]

        var [rows] = await pool.execute('select NAME as PARTY,DATE_JOINED, party.id as P_ID from user LEFT JOIN party_join ON user.id = party_join.member JOIN party ON party_join.PARTY = party.ID where user.id = ? ', [ID])
        let final_info = { "ROLE": ROLE, ...info, ...rows }

        res.status(200).json(final_info)
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

const u_detailView = async(req, res) => {
    try { 
        let id = req.params.id
        
        let [rows] = await pool.query("select * from user join auth on user.id = auth.id where user.id = ? ",[id])
      
        res.status(200).json(rows[0])
    } catch (error) {
        res.status(200).json(error)
    }
}

export default { profileView, enrolledView, mycourseView, u_detailView }