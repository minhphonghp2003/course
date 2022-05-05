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

const joinParty = async (req,res)=>{
    try {
        let {ID} = req.data
        let p_id = req.params.id
        let [rows] = await pool.execute("select mem_num, max from party where id =?",[p_id])
        // console.log(rows[0]);
        let {mem_num , max} = rows[0]
        if(mem_num === max){
            return res.status(400).json("Party is full")
        }
        await pool.execute("insert into party_join (party,member) values (?,?) ",[p_id,ID])
        await pool.execute("update party set mem_num = mem_num + 1")
       
        res.status(400).json(p_id)
    } catch (error) {
        res.status(400).json(error)
    }
}

export default { partyView, p_detailView, joinParty }