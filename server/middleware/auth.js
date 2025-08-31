import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// Middleware to protect routes

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = decoded.userId;

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(401).json({ success: false, message: "User not found" });
        }
        req.user = user;
        next();
        // if (!token) {
        //     return res.status(401).json({ success: false, message: "No token provided" });
        // }

        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = decoded.userId;
        // next();
    } catch (error) {
        console.error(error.message);
        res.status(401).json({ success: false, message: error.message });
    }
}