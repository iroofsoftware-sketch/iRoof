import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
    let token = req.cookies?.token; 

   
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const authenticateResetToken = (req, res, next) => {
    let token = req.cookies?.resetToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.status(401).json({ message: "Unauthorized: No reset token provided" });

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired reset token" });
    }
};