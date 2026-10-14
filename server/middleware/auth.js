import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ success: false, message: "not authorized" });
    }
    try {
        const userId = jwt.verify(token, process.env.JWT_SECRET);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "not authorized",

            });
        }
        req.user = await User.findById(userId).select("-password");
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "not authorized",

            });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "not authorized",

        });
    }
}
export const requireOwner = async (req, res, next) => {
    const role = req.user.role;
    if (role === "owner") {
        next();
        return;
    }
    res.status(403).json({
        success: false,
        message: "Forbidden: owner role required"
    });
}