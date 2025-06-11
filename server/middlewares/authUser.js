import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    const { token } = req.cookies;
    console.log("authUser middleware running...")
    if (!token) {
        console.log("NO token found")
        return res.json({ success: false, message: 'Not Authorized' });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if (tokenDecode.id) {
            req.userId = tokenDecode.id;  //Better than modifying req.body
            console.log("User ID from token: ", req.userId)
        } else {
            console.log("Token decode failed");
            return res.json({ success: false, message: 'Token decode failed' });
        }
        next();
    } catch (error) {
        console.log("JWT verify error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

export default authUser;
