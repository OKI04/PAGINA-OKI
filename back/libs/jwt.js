const { TOKEN_SECRET } = require('../config');
const jwt = require('jsonwebtoken');

const createAccessToken = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload, 
            TOKEN_SECRET,
            {
                expiresIn: "100m",
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