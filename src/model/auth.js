import mysql2 from 'mysql2/promise'

const pool = mysql2.createPool({
  host: '192.168.1.6',
  user: 'root',
  database: 'course',
  
});

export {pool}