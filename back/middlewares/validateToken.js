const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = require("../config");

const authRequired = (req, res, next) => {
    let token = req.cookies.token;

    // Buscar también en el header Authorization
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        if (process.env.NODE_ENV !== 'production') console.log("No token provided");
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    jwt.verify(token, TOKEN_SECRET, (err, user) => {
        if (err) {
            if (process.env.NODE_ENV !== 'production') console.log("Token verification failed:", err.message);
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        req.user = user;
        if (process.env.NODE_ENV !== 'production') console.log("Token validated for user:", user.id);
        next();
    });
};

module.exports = {
    authRequired
};
