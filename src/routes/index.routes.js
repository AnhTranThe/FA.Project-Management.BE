const express = require("express");
const router = express.Router();
const VerifyToken = require("../middlewares/verifyToken");

const {Login, Register, RefreshToken} = require("../controllers/auth/auth.controller");
const {GetUser, GetUserById, GetUsersJoinInProject, GetProjectBySearch} = require("../controllers/users/getUser.controller");
const CreateUser = require("../controllers/users/createUser.controller");
const DeleteUser = require("../controllers/users/deleteUser.controller");
const {GetProject, GetProjectById, GetProjectByUser} = require("../controllers/project/getProject.controller");
const {CreateProject, addUserInProject} = require("../controllers/project/createProject.controller");
const {DeleteProject, deleteUserInproject} = require("../controllers/project/deleteProject.controller");
const {GetTask, GetTaskById, GetTaskByProjectId, GetTaskByUser} = require("../controllers/task/getTask.controller");
const CreateTask = require("../controllers/task/createTask.controller");
const DeleteTask = require("../controllers/task/deleteTask.controller");
const PutUser = require("../controllers/users/putUser.controller");
const PutProject = require("../controllers/project/putProject.controller");
const PutTask = require("../controllers/task/putTask.controller");
const ChangeRoleUser = require("../controllers/users/changeRoleUser.controller");
const changeHostProject = require("../controllers/project/changeHostProject.controller");

// ROUTES
// Home
router.get("/", (req, res, next) => {
  res.send("<h1>HOME PAGE</h1>");
});

// Auth
router.post("/api/login", Login);
router.post("/api/register", Register);
router.get("/api/refresh-token", RefreshToken);

// User
router.get("/api/user", VerifyToken, GetUser);
router.get("/api/user/:id", VerifyToken, GetUserById);
router.post("/api/user", VerifyToken, CreateUser);
router.delete("/api/user", VerifyToken, DeleteUser);
router.put("/api/user", VerifyToken, PutUser);
router.get("/api/user/GetUsersJoinInProject/:projectId", VerifyToken, GetUsersJoinInProject);
router.put("/api/user/changerole", VerifyToken, ChangeRoleUser);

// Project
router.get("/api/project", VerifyToken, GetProject);
router.get("/api/project/:id", VerifyToken, GetProjectById);
router.get("/api/project/byName", VerifyToken, GetProjectBySearch);
router.post("/api/project/", VerifyToken, CreateProject);
router.post("/api/project/add-user-in-project/:project_id", VerifyToken, addUserInProject);
router.delete("/api/project/", VerifyToken, DeleteProject);
router.delete("/api/project/delete-user-in-project/:project_id", VerifyToken, deleteUserInproject);
router.put("/api/project/", VerifyToken, PutProject);

// Change host project
router.put("/api/changeHostProject/", VerifyToken, changeHostProject);

// Task
router.get("/api/task", VerifyToken, GetTask);
router.get("/api/task/:id", VerifyToken, GetTaskById); //GetTaskDetail
router.post("/api/task", VerifyToken, CreateTask);
router.delete("/api/task", VerifyToken, DeleteTask);
router.put("/api/task/", VerifyToken, PutTask);

// GetTaskBy.......
router.get("/api/gettaskbyprojectid/:id", VerifyToken, GetTaskByProjectId); //GetTaskByProjectId
router.get("/api/gettaskbyuser/:name", VerifyToken, GetTaskByUser); //GetTaskByUser

// GetProjectBy.......
router.get("/api/getprojectbyuser/:email", VerifyToken, GetProjectByUser); //GetProjectByUser

module.exports = router;
