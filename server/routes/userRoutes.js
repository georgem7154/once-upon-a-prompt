import { Router } from "express";
import { validatePassword } from "../middleware/validationMiddleware.js";
const router = Router();
import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserByEmailFromToken,
  getAllUsers,
  getUser,
  login,
  logout,
  updateUser,
  verifyToken,
} from "../controller/userController.js";
router.route("/").post(createUser);
router.route("/:id").delete(deleteUser).patch(updateUser).get(getUser);
router.route("/find/userbyemail").get(findUserByEmailFromToken);
router.route("/login/user").post(login);
router.route("/find/user").get(findUserByEmail)
router.route("/logout/user").post(logout);
router.route("/verifytoken/user").get(verifyToken);

// localhost:5000/user/
export default router;
