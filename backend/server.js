// server.js (Phiên bản Hoàn thiện với API send-location)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { executeQuery } = require('./db/sql');
const { protect } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000; // Đặt cổng mặc định 4000
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware cơ bản
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// *******************************************************
// 1. API ĐĂNG NHẬP (PUBLIC)
// *******************************************************

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    const checkUserQuery = `
        SELECT u.UserID, u.Username, u.Role, u.PasswordHash, u.FullName, d.DriverID
        FROM Users u
        LEFT JOIN Drivers d ON u.UserID = d.UserID
        WHERE u.Username = '${username}';
    `;
    
    try {
        const users = await executeQuery(checkUserQuery);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại.' });
        }
        
        const user = users[0];
        
        // --- PHẦN XÁC THỰC MẬT KHẨU (Giả lập) ---
        const expectedHash = `hashed_password_${username.split('_')[1]}`; 
        if (user.PasswordHash !== expectedHash) {
             if (password !== '123456') { 
                 return res.status(401).json({ message: 'Mật khẩu không chính xác.' });
             }
        }
        // ------------------------------------------

        // Tạo JWT Token
        const token = jwt.sign(
            { UserID: user.UserID, FullName: user.FullName, Role: user.Role, DriverID: user.DriverID },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        res.json({
            token,
            Role: user.Role, 
            DriverID: user.DriverID,
            FullName: user.FullName
        });

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
    }
});

// *******************************************************
// 2. API CẦN XÁC THỰC (DRIVER PROTECTED ROUTES)
// *******************************************************
app.use('/api/driver', protect); 

/**
 * GET /api/driver/schedule/today
 * Lấy lịch làm việc hôm nay của tài xế đang đăng nhập.
 */
app.get('/api/driver/schedule/today', async (req, res) => {
    const driverId = req.user.DriverID; 

    const sql = `
        SELECT 
            s.ScheduleID, r.RouteID, r.RouteName, 
            b.BusID, b.PlateNumber, 
            CONVERT(VARCHAR(5), s.DepartureTime, 108) AS DepartureTime,
            s.Status
        FROM DailySchedule s
        JOIN Routes r ON s.RouteID = r.RouteID
        JOIN Buses b ON s.BusID = b.BusID
        WHERE s.DriverID = ${driverId} 
        AND s.ScheduleDate = CAST(GETDATE() AS DATE)
        ORDER BY s.DepartureTime ASC;
    `;

    try {
        const schedule = await executeQuery(sql);
        res.json(schedule);
    } catch (error) {
        res.status(error.status || 500).json({ message: 'Không thể tải lịch làm việc.' });
    }
});

/**
 * GET /api/driver/schedule/:scheduleId/details
 * Lấy chi tiết tuyến đường, trạm dừng, và danh sách học sinh cần đón cho 1 chuyến.
 */
app.get('/api/driver/schedule/:scheduleId/details', async (req, res) => {
    const { scheduleId } = req.params;
    const driverId = req.user.DriverID;

    const checkOwnership = `
        SELECT DriverID, RouteID FROM DailySchedule 
        WHERE ScheduleID = ${scheduleId} AND DriverID = ${driverId};
    `;

    try {
        const trip = await executeQuery(checkOwnership);
        if (trip.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy chuyến đi hoặc bạn không có quyền.' });
        }
        const routeId = trip[0].RouteID;

        const stopsSql = `
            SELECT StopID, StopName, Latitude, Longitude, OrderInRoute, IsPickup, IsDropoff
            FROM Stops 
            WHERE RouteID = ${routeId} 
            ORDER BY OrderInRoute ASC;
        `;
        const stops = await executeQuery(stopsSql);

        const studentsSql = `
            SELECT 
                s.StudentID, s.FullName, s.PickupStopID
            FROM Students s
            JOIN Stops st ON s.PickupStopID = st.StopID
            WHERE st.RouteID = ${routeId};
        `;
        const students = await executeQuery(studentsSql);

        const stopsWithStudents = stops.map(stop => ({
            ...stop,
            students_here: students.filter(student => student.PickupStopID === stop.StopID)
        }));


        res.json({
            scheduleId: parseInt(scheduleId),
            routeId: routeId,
            stops: stopsWithStudents,
            all_students_on_route: students
        });

    } catch (error) {
        res.status(error.status || 500).json({ message: 'Không thể tải chi tiết chuyến đi.' });
    }
});

/**
 * POST /api/driver/trip/:scheduleId/start
 * Bắt đầu chuyến đi. Cập nhật trạng thái và ghi nhận thời gian.
 */
app.post('/api/driver/trip/:scheduleId/start', async (req, res) => {
    const { scheduleId } = req.params;
    const driverId = req.user.DriverID;

    const sql = `
        UPDATE DailySchedule 
        SET Status = 'IN_PROGRESS' 
        WHERE ScheduleID = ${scheduleId} AND DriverID = ${driverId};
    `;

    try {
        await executeQuery(sql);
        res.json({ message: `Chuyến ${scheduleId} đã bắt đầu.` });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái chuyến đi.' });
    }
});

/**
 * POST /api/driver/location
 * [API MỚI] Gửi vị trí xe theo thời gian thực (tối đa 3 giây).
 */
app.post('/api/driver/location', async (req, res) => {
    const { scheduleId, latitude, longitude } = req.body;
    const driverId = req.user.DriverID;
    
    // TODO: Trong MVP, chúng ta chỉ cần API này tồn tại để Front-end gọi, 
    // nhưng trong thực tế, nên dùng Websocket và lưu dữ liệu vào bảng riêng.
    console.log(`[GPS] Driver ${driverId} for Trip ${scheduleId}: ${latitude}, ${longitude}`);

    // Giả lập lưu thành công
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});


// *******************************************************
// 3. KHỞI ĐỘNG SERVER
// *******************************************************

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
    console.log(`Kết nối DB: ${process.env.DB_SERVER || process.env.DB_HOST}/${process.env.DB_DATABASE || process.env.DB_NAME}`);
});