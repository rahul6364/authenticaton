const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');



// exports.identifier = async (req, res, next) => {
//     let token;
//     if (req.headers.client === 'not-browser') {
//         token = req.headers.authorization
//     } else {
//         // token = req.cookies['Authorization']
//         token = req.cookies ? req.cookies['Authorization'] : null;
//     }

//     if (!token) {
//         return res.status(403).json({
//             success: false,
//             message: 'unauthorized'
//         })
//     }

//     try {
//         const parts = token.split(' ');
//         if (parts.length !== 2 || parts[0] !== 'Bearer') {
//             return res.status(403).json({ success: false, message: 'Invalid token format' });
//         }
//         const userToken = parts[1];

//         const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRETE)

//         if (jwtVerified) {
//             req.user = jwtVerified;
//             next();
//         } else {
//             throw new Error(' error in the token')
//         }
//     } catch (error) {
//         console.log("JWT Verification Error:", error.message);
//         return res.status(403).json({
//             success: false,
//             message: 'Invalid or expired token'
//         });
//     }
// }

exports.identifier = async (req, res, next) => {
    let token;

    if (req.headers.client === 'not-browser') {
        token = req.headers.authorization;
    } else {
        token = req.cookies ? req.cookies['Authorization'] : null;
    }

    if (!token) {
        return res.status(403).json({
            success: false,
            message: 'unauthorized'
        });
    }

    try {
        const parts = token.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(403).json({
                success: false,
                message: 'Invalid token format'
            });
        }

        const userToken = parts[1];
        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);

        if (jwtVerified) {
            req.user = jwtVerified;
            next();
        } else {
            throw new Error('Token verification failed');
        }
    } catch (error) {
        console.log("JWT Verification Error:", error.message);
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

