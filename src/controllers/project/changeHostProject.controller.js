const db = require("../../connection/database.connection");

const changeHostProject = async (req, res, next) => {
  const client = await db.connect();

  try {
    const {project_id, new_host_user_id} = req.body;

    // Begin transaction
    await client.query("BEGIN");

    // Check if the project exists
    const checkProject = await client.query("SELECT * FROM project WHERE id = $1", [project_id]);
    if (checkProject.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({code: 400, message: "Project not found"});
    }

    // Check if the new host exists
    const checkNewHost = await client.query('SELECT * FROM "user" WHERE id = $1', [new_host_user_id]);
    if (checkNewHost.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({code: 400, message: "New host not found"});
    }

    // Update the host in the map_project_user table
    await client.query("UPDATE map_project_user SET is_host = false WHERE project_id = $1", [project_id]);
    await client.query("UPDATE map_project_user SET is_host = true WHERE project_id = $1 AND user_id = $2", [
      project_id,
      new_host_user_id,
    ]);

    // Commit transaction
    await client.query("COMMIT");
    res.status(200).json({code: 200, message: "Change host success"});
  } catch (err) {
    // Rollback transaction in case of error
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  } finally {
    client.release(); // Release client back to the db
  }
};
module.exports = changeHostProject;
