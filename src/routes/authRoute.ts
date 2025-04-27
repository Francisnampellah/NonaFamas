import { register,login } from "../controllers/authController.js";

import { Router } from "express";

const router = Router();

router.post("/register", register);

router.get("/logout", (req, res) => {
    // Clear the JWT token from the client-side storage (e.g., localStorage or cookies)
    res.clearCookie("token"); // Assuming you're using cookies to store the token
    res.status(200).json({ message: "Logged out successfully" });
    }
);
export default router;
// This code defines the authentication routes for user registration and login.
// It uses the Express Router to create routes for handling POST requests to "/register" and "/login".