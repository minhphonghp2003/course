import mysql2 from 'mysql2/promise'

const pool = mysql2.createPool({
  host: 'localhost',
  user: 'root',
  database: 'course',
  
});

export {pool}