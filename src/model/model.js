
import mysql2 from 'mysql2/promise'
import fs from 'fs'

const pool = mysql2.createPool({
  host: '192.168.1.6',
  user: 'root',
  database: 'course',

});

const paginate = async (models, page, size) => {
  let page_data = {}

  let [data] = await pool.execute(`select * from ${models} order by date_added desc`)
  // ---------------first element of this page
  if (page <= 0 || !data[size * (page - 1)]) {
    return { error: "No data " }
  }
  if (page > 1) {
    page_data.prev_page = page - 1
  }
  // first element of next page
  if (data[page * size]) {
    page_data.next_page = page + 1
  }
  let pageele = data.slice((page - 1) * size, page * size)
  for (const r of pageele) {
    let img = fs.readFileSync(r.POSTER)
    r.POSTER = img
  }
  page_data.element = pageele
  return page_data
}

const getReview = async (id)=>{
  let [reviews]= await pool.execute("select * from review where id = ?",[id])
  return reviews[0]
}

const addReview = async (user, course, content) => {
  await pool.execute("insert into review (user,course,content) values (?,?,?)", [user, course, content])

}

const delReview = async (review) => {
  await pool.execute("delete from review where id = ?", [review])
}

export { pool, paginate, addReview, delReview, getReview }