import { pool } from "../model/auth.js";

const partyView = async (req, res) => {
    let [rows] = await pool.execute("select * from party")
    res.status(200).json(rows)
}

const p_detailView = async (req, res) => {
    
    try {
        let id = req.params.id
        var [rows] = await pool.execute("select * from party where id =?",[id])
        let party_info = rows[0]
        
        var [rows] = await pool.execute("select user.id as u_id, user.full_name,user.level from user JOIN party_join as p_j ON user.ID = p_J.member JOIN party ON p_j.party = party.id where party.id = ?", [id])
        
        let party_mem = rows 
        let info = {...party_info,...party_mem}
        
        res.status(200).json(info)
    } catch (error) {
        res.status(200).json(error)
    }
}

export default { partyView, p_detailView }