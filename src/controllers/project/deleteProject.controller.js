const QueryDatabase = require("../../utils/queryDatabase");
const {v4: uuidv4, validate: validateUuid} = require("uuid");

const DeleteProject = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const id = req.body.id;

    // Check có truyền vào id hay ko
    if (!id) {
      return res.status(400).json({code: 400, message: "Missing id"});
    }
    // Kiểm tra xem project_id đúng định dạng uuid ko
    const isValidUuid = validateUuid(id);
    if (isValidUuid == false) {
      res.status(400).json({code: 400, message: "Wrong format uuid"});
      return;
    }
    // Begin transaction
    await client.query("BEGIN");

    // Check id có trong CSDL hay khong
    const checkId = await client.query("SELECT * FROM project WHERE id = $1", [id]);
    if (checkId.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({code: 400, message: "Project not found"});
    }

    // Delete project and associated entries in map_project_user
    await client.query("DELETE FROM project WHERE id = $1", [id]);
    await client.query("DELETE FROM map_project_user WHERE project_id = $1", [id]);

    // Commit transaction
    await client.query("COMMIT");

    res.status(200).json({code: 200, message: "Delete Project success"});
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  } finally {
    client.release(); // Release client back to the pool
  }
};

module.exports = DeleteProject;
