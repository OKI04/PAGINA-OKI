const { TOKEN_SECRET } = require('../config');
const jwt = require('jsonwebtoken');
console.log("✅ TOKEN generado:", token);

const createAccessToken = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload, 
            TOKEN_SECRET,
            {
                expiresIn: "24h",
            },
            (err, token) => {
                if(err) reject (err)
                resolve(token)
            }
        )
    })
}

module.exports = {
    createAccessToken
}