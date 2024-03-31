import { Router } from "express";
import { logOut, loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/authentication.middleware.js";

const router = Router();
// public routes
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1,
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser);
// router.post('/register', registerUser);

router.route("/login").post(loginUser)
// Secure routes

router.route("/logout").post(verifyJwt , logOut)
export default router;
