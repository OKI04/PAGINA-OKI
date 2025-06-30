const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = require("../config");

const authRequired = (req, res, next) => {
    console.log("Validing Token");
    let token = req.cookies.token;

    // Si no hay token en cookie, buscar en Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) return res.status(401).json({ message: "No token, authorization denied"});

    jwt.verify(token, TOKEN_SECRET, (err, user) => {
        if(err) return res.status(403).json({ message: "Invalid token"});

        req.user = user;
        next();
    })
}

module.exports = {
    authRequired
}