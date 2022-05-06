import { pool } from '../model/auth.js'

const courseView = async (req, res) => {
    let [rows] = await pool.execute("select * from course ORDER BY date_added DESC")
    res.status(200).json(rows)
}

const cateView = async (req, res) => {
    let [rows] = await pool.execute("select * from category")
    res.status(200).json(rows)
}

const catedetailView = async (req, res) => {
    try {
        let cate = req.params.cate
        // console.log(typeof(id), id);
        let [rows] = await pool.execute("select name as course_name,c.cate as cate_name,course.id as course_id,difficulty,price from course JOIN category as c ON course.CATE = c.ID where c.CATE=?", [cate])
        res.status(200).json(rows)
    } catch (error) {
        res.status(400).json({error:"ERROR"})
    }

}

const coursedetailView = async (req, res) => {
    try {
        let id = req.params.id
        var [rows] = await pool.execute("select * from course where id =?", [id])
        let course = rows[0]
        var [rows] = await pool.execute("select CATE from category where id =?",[course.CATE])
        let cate = rows[0]
        let data = {...course,...cate}
        res.status(200).json(data)
    } catch (error) {
        res.status(400).json({error:"ERROR"})
    }

}

export default { courseView, cateView, catedetailView, coursedetailView }