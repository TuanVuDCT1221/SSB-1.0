// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware kiểm tra JWT Token trong header Authorization.
 */
const protect = (req, res, next) => {
    let token;

    // Kiểm tra header Authorization (ví dụ: Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Không được phép truy cập. Thiếu token.' });
    }

    try {
        // Giải mã token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Gắn UserID và Role vào request để sử dụng ở các route tiếp theo
        req.user = { 
            UserID: decoded.UserID, 
            Role: decoded.Role,
            DriverID: decoded.DriverID // Gắn DriverID vào request
        };
        
        // Kiểm tra vai trò phải là DRIVER
        if (req.user.Role !== 'DRIVER') {
             return res.status(403).json({ message: 'Truy cập bị cấm. Chỉ dành cho Tài xế.' });
        }

        next(); // Tiếp tục xử lý request
    } catch (error) {
        console.error("Lỗi xác thực token:", error.message);
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

module.exports = { protect };