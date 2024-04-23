const db = require("../connection/database.connection");

const QueryDatabase = async (sql) => {
  try {
    const client = await db.connect();
    const data = await client.query(sql);
    client.release(); // Giải phóng client sau khi sử dụng
    return data;
  } catch (err) {
    console.error("Database Query Error ");
    throw err; // Ném lại lỗi để xử lý ở nơi gọi hàm
  }
};

module.exports = QueryDatabase;
