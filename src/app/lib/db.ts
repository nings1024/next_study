// lib/db.ts
import mysql from 'mysql2/promise';

// 创建数据库连接池
export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '831015',
  database: 'greatwall', // 如果你已有某个数据库名，写在这，否则可以用 SQL 创建
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
