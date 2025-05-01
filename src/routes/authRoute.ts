import { register, login, refreshToken, getCurrentUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

import { Router } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login as any);
router.post("/refresh", refreshToken as any);
router.get("/me", protect as any, getCurrentUser as any);

router.get("/logout", (req, res) => {
    // Clear the JWT token from the client-side storage (e.g., localStorage or cookies)
    res.clearCookie("token"); // Assuming you're using cookies to store the token
    res.status(200).json({ message: "Logged out successfully" });
    }
);
export default router;
// This code defines the authentication routes for user registration and login.
// It uses the Express Router to create routes for handling POST requests to "/register" and "/login".