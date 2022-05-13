import { pool, paginate, addReview, delReview, getReview } from '../model/model.js'
import fs from 'fs'

const courseView = async (req, res) => {
    let page = parseInt(req.query.page)
    let page_element =await paginate("course",page,4)
    return res.json(page_element)
    
}

const cateView = async (req, res) => {
    let [rows] = await pool.execute("select * from category")
    return res.status(200).json(rows)
}

const catedetailView = async (req, res) => {
    try {
        let cate = req.params.cate

        let [rows] = await pool.execute("select * from course JOIN category as c ON course.CATE = c.CATE where c.CATE=?", [cate])

        return res.status(200).json(rows)
    } catch (error) {
        res.status(500).json({ error: "ERROR" })
    }

}

const coursedetailView = async (req, res) => {
    try {

        let id = req.params.id
        var [rows] = await pool.execute("select * from course  where id =?", [id])
        let course = rows[0]
        let [review] = await pool.execute("select * from review where course = ?",[id])
        
        let { MENTOR } = rows[0]
        var [rows] = await pool.execute("select full_name from user where id = ?", [MENTOR])
        let m_name = rows[0].full_name
        var [rows] = await pool.execute("select learner from enrolled where course = ?", [id])
        let learner = rows

        course.POSTER = fs.readFileSync(course.POSTER)
        let data = { ...course, ...{ M_NAME: m_name }, ...learner,...{review:review} }
        return res.status(200).json(data)
    } catch (error) {
        res.status(404).json({ error: error })
    }

}

const courseAdd = async (req, res) => {
    try {
        let { name, desc, diff, time, price, cate } = req.body
        let { ID, ROLE } = req.data

        if (ROLE !== 'mentor') {
            return res.status(400).json({ error: "You're not a mentor" })
        }
        let img = req.file.destination + req.file.filename
        await pool.execute("insert into course (name,descrp,difficulty,time,mentor,price,cate,poster) values (?,?,?,?,?,?,?,?)", [name, desc, diff, time, ID, price, cate, img])
        let [rows] = await pool.execute("select * from course where name =?", [name])
        return res.status(200).json(rows[0])
    } catch (error) {

        res.status(500).json({ error: error })
    }
}

const courseUpdate = async (req, res) => {
    try {
        let { ID } = req.data
        let { c_id } = req.body
        let [rows] = await pool.execute("select mentor from course where id =?", [c_id])
        let mentor = rows[0].mentor

        if (ID !== mentor) {
            return res.status(400).json("You're not the course's owner")
        }
        let { name, desc, diff, time, price, cate } = req.body
        let img = req.file.destination + req.file.filename
        await pool.execute("update course set name=?, descrp=?,difficulty=?,time=?,mentor=?,price=?,cate=?,poster=? where id =?", [name, desc, diff, time, mentor, price, cate, img, c_id])

        return res.status(200).json("DONE")
    } catch (error) {

        return res.status(400).json({ error: "Error" })
    }
}

const courseDelete = async (req, res) => {
    try {
        let { ID } = req.data
        let { c_id } = req.body
        let [rows] = await pool.execute("select mentor from course where id =?", [c_id])
        let mentor = rows[0].mentor
        if (ID !== mentor) {
            return res.status(400).json("You're not the course's owner")
        }
        await pool.execute("delete from course where id = ?", [c_id])
        return res.status(200).json("DONE")
    } catch (error) {
        res.status(400).json(error)
    }
}

const courseRate = async (req, res) => {
    try {
        let { rate, c_name } = req.body
        let [rows] = await pool.execute("select rate from course where name = ?", [c_name])
        let cur_rate = (parseFloat(rows[0].rate) + parseFloat(rate)) / 2.0


        await pool.execute("update course set rate = ? where name = ?", [cur_rate, c_name])
        return res.status(200).json("DONE")
    } catch (err) {
        res.status(400).json(err)
    }
}


const reviewAdd = async (req,res)=>{
    try {
       let {course,content}  = req.body
       let user = req.data.ID
       await addReview(user,course,content)
       return res.json(content)
    } catch (error) {
        res.status(500).json({error:error})
    }
}

const reviewDel = async (req,res) =>{
    try {
        let id = req.body.review 
        let reviews =await getReview(id)
       
        if (!reviews || reviews.USER !== req.data.ID) {
           
           return res.status(500).json({error:"You're not the review owner"}) 
        }
        await delReview(id)

        return res.json("DONE")
    } catch (error) {
       res.status(500).json({error:error}) 
    }
}


export default { courseView, cateView, catedetailView, coursedetailView, courseAdd, courseUpdate, courseDelete, courseRate, reviewAdd, reviewDel }