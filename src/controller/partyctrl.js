import { pool } from "../model/model.js";



const partyView = async (req, res) => {
    var [rows] = await pool.execute("select * from party")
    let p_info = [...rows]

    res.status(200).json(p_info)
}

const p_detailView = async (req, res) => {

    try {

        let id = req.params.id
        var [rows] = await pool.execute("select * from party where id =?", [id])
        let party_info = rows[0]

        var [rows] = await pool.execute("select user.id as u_id, user.full_name,user.level from user JOIN party_join as p_j ON user.ID = p_J.member JOIN party ON p_j.party = party.id where party.id = ?", [id])

        let party_mem = rows

        let info = { ...party_info, ...party_mem }

        return res.status(200).json(info)
    } catch (error) {
        res.status(200).json(error)
    }
}

const joinParty = async (req, res) => {
    try {
        let { ID } = req.data
        let p_id = req.params.id
        var [rows] = await pool.execute("select mem_num, max from party where id =?", [p_id])

        let { mem_num, max } = rows[0]

        if (mem_num === max) {
            return res.status(400).json("Party is full")
        }
        await pool.execute("insert into party_join (party,member) values (?,?) ", [p_id, ID])
        await pool.execute("update party set mem_num =(select count(member) from party_join where party = ?) where id =?", [p_id, p_id])

        return res.status(200).json("DONE")
    } catch (error) {
        res.status(400).json("You have joined the party")
    }
}

const leaveParty = async (req, res) => {
    try {
        let { ID } = req.data
        let p_id = req.params.id


        await pool.execute("DELETE FROM party_join WHERE party=? and member =? ", [p_id, ID])

        await pool.execute("update party set mem_num = (select count(member) from party_join where party = ?) where id =?", [p_id, p_id])

        let [rows] = await pool.execute("select mem_num from party where id =?", [p_id])
        let { mem_num } = rows[0]

        if (mem_num === 0) {
            await pool.execute("delete from party where id =?", [p_id])
        }
        res.status(200).json("DONE")
    } catch (error) {
        res.status(400).json("You haven't joined the party yet")
    }
}

const createParty = async (req, res) => {
    try {
        let { name, max } = req.body
        await pool.execute("insert into party (name,mem_num,max) values(?,1,?)", [name, max])
        let [rows] = await pool.execute("select id from party where name =?", [name])
        await pool.execute("insert into party_join (party,member) values (?,?)", [rows[0].id, req.data.ID])
        res.status(200).json("DONE")
    } catch (error) {

        res.status(400).json(error)
    }
}

const updateParty = async (req, res) => {

    try {
        let p_id = req.params.id
        let {name,max} = req.body
        await pool.execute("update party set name = ?, max=? where id = ?",[name,max,p_id])
        res.status(200).json("UPDATED")
    } catch (error) {
        res.status(400).json(error)
    }
}

export default { updateParty, partyView, p_detailView, joinParty, leaveParty, createParty }