import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Driver.css'; // Sử dụng CSS của bạn
import {
    FaBus, FaMapMarkerAlt, FaUserCheck, FaUserTimes, FaCheckCircle,
    FaHourglassStart, FaFlagCheckered, FaListAlt, FaExclamationTriangle, FaArrowRight, FaSchool, FaLocationArrow
} from 'react-icons/fa';
import axios from 'axios'; // Import Axios

// --- CẤU HÌNH API & HOST ---
const API_URL = 'http://localhost:4000/api'; // Host của Node.js Backend

// --- Custom Icons (Dùng class CSS TOÀN CỤC) ---
// Giữ nguyên các định nghĩa icon
const driverIcon = L.divIcon({ className: 'driver-marker', html: '<i class="fas fa-location-arrow"></i>', iconSize: [25, 25], iconAnchor: [12, 12] });
const stopIcon = (id, isCurrent = false) => L.divIcon({
    className: `stop-marker-driver ${isCurrent ? 'current' : ''}`,
    html: `<span>${id}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});
const schoolIcon = L.divIcon({ className: 'school-marker', html: '<i class="fas fa-school"></i>', iconSize: [25, 25], iconAnchor: [12, 12] });

// --- Map Updater Component ---
function MapUpdater({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom() < 15 ? 15 : map.getZoom());
        }
    }, [position, map]);
    return null;
}

// Hàm giả lập nội suy (Linear Interpolation) cho chuyển động mượt mà
// Tính toán 10 bước di chuyển nhỏ giữa hai tọa độ
function interpolate(start, end, step, totalSteps) {
    const t = step / totalSteps;
    const lat = start[0] + (end[0] - start[0]) * t;
    const lng = start[1] + (end[1] - start[1]) * t;
    return [lat, lng];
}
function AlertModal({ isOpen, onClose, studentsOnTrip, selectedTrip, driverPosition, getAuthHeaders }) {
    if (!isOpen || !selectedTrip) return null;

    // Lọc danh sách phụ huynh duy nhất và học sinh liên quan (Dựa trên logic giả định ParentID)
    const parentsMap = studentsOnTrip.reduce((acc, student) => {
        const parentId = student.id % 2 === 0 ? 2 : 1;
        const parentName = student.name.replace(/(Nguyễn Thị|Lê Văn|Trần Minh|Hoàng Yến|Phạm Tuấn|Đinh Kim|Võ Thanh|Ngô Mai)/, 'Phụ huynh');

        if (!acc[parentId]) {
            acc[parentId] = {
                id: parentId,
                name: parentName,
                students: []
            };
        }
        acc[parentId].students.push(student);
        return acc;
    }, {});

    const uniqueParents = Object.values(parentsMap);

    const commonAlerts = [
        { type: 'DELAY', message: 'Xe bị trễ so với lịch trình.', target: 'ALL' },
        { type: 'TRAFFIC', message: 'Xe đang gặp tình trạng giao thông nghiêm trọng.', target: 'ALL' },
        { type: 'BREAKDOWN', message: 'Xe gặp sự cố kỹ thuật và phải dừng khẩn cấp.', target: 'ALL' },
        { type: 'ARRIVED', message: 'Xe đã đến trường (Hoàn thành hành trình).', target: 'ALL' },
    ];

    const handleSend = async (type, message, studentId = null, parentName = null) => {
        const payload = {
            scheduleId: selectedTrip.schedule_id,
            alertType: type,
            message: message,
            latitude: driverPosition ? driverPosition[0] : null,
            longitude: driverPosition ? driverPosition[1] : null,
            studentId: studentId
        };

        try {
            // TODO: Gọi API POST /api/driver/alert

            const target = studentId ? `Phụ huynh ${parentName} (HS: ${studentsOnTrip.find(s => s.id === studentId).name})` : 'Tất cả phụ huynh';

            console.log(`--- GỬI CẢNH BÁO ---`);
            console.log(`Loại: ${type}`);
            console.log(`Nội dung: ${message}`);
            console.log(`Đến: ${target}`);
            alert(`Đã gửi cảnh báo thành công tới ${target}.`);
            onClose();

        } catch (error) {
            console.error("Lỗi gửi cảnh báo:", error);
            alert("Gửi cảnh báo thất bại. Vui lòng thử lại.");
        }
    };

    const handleIndividualAlert = (student, type) => {
        const message = type === 'INDIVIDUAL_ISSUE' ? `Có vấn đề liên quan đến học sinh ${student.name.split(' ').pop()}.` : 'Lỗi không xác định.';
        const parent = uniqueParents.find(p => p.students.some(s => s.id === student.id));
        handleSend(type, message, student.id, parent ? parent.name : 'Phụ huynh');
    }


    return (
        <div className="alert-modal-overlay">
            <div className="alert-modal-content card">
                <h2><FaExclamationTriangle /> Gửi Cảnh Báo Khẩn</h2>
                <p className="location-info">Vị trí hiện tại: {driverPosition ? `${driverPosition[0].toFixed(4)}, ${driverPosition[1].toFixed(4)}` : 'Đang tìm...'}</p>

                <h3 className="section-title">1. Cảnh báo Chung (Gửi ALL)</h3>
                <div className="alert-list common">
                    {commonAlerts.map(alert => (
                        <button key={alert.type}
                            className={`btn-alert btn-${alert.type.toLowerCase()}`}
                            onClick={() => handleSend(alert.type, alert.message)}>
                            {alert.message}
                        </button>
                    ))}
                </div>

                <h3 className="section-title">2. Cảnh báo Riêng lẻ (Theo Học sinh)</h3>
                <div className="parent-list">
                    {uniqueParents.map(parent => (
                        <div key={parent.id} className="parent-item">
                            <h4>Phụ huynh: {parent.name}</h4>
                            <div className="student-alert-actions">
                                {parent.students.map(student => (
                                    <button
                                        key={student.id}
                                        className={`btn-alert btn-individual`}
                                        onClick={() => handleIndividualAlert(student, 'INDIVIDUAL_ISSUE')}>
                                        Vấn đề HS {student.name.split(' ').pop()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="btn btnBack" onClick={onClose} style={{ marginTop: '20px' }}>Đóng</button>
            </div>
        </div>
    );
}

// --- DriverPage Component ---
function DriverPage() {
    const [dailySchedule, setDailySchedule] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [appState, setAppState] = useState('loading'); // Thêm trạng thái loading/login
    const [studentsOnTrip, setStudentsOnTrip] = useState([]);
    const [driverPosition, setDriverPosition] = useState(null);
    const [auth, setAuth] = useState({ token: localStorage.getItem('jwt_token'), driverId: null, fullName: localStorage.getItem('driver_full_name') || null });
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    // Login form state moved to top-level to avoid conditional hooks
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Trạng thái mô phỏng
    const gpsIntervalRef = useRef(null);
    const movementRef = useRef({ step: 0, totalSteps: 30, segmentIndex: 0 }); // 30 bước di chuyển/segment

    // Hàm chung để lấy headers có Token
    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${auth.token}` }
    });



    // ********************************************************
    // 1. LOGIC XÁC THỰC & TẢI LỊCH TRÌNH BAN ĐẦU
    // ********************************************************

    // Tải lịch làm việc sau khi có token
    const fetchDailySchedule = async () => {
        if (!auth.token) return setAppState('login');

        try {
            const res = await axios.get(`${API_URL}/driver/schedule/today`, getAuthHeaders());

            // Xử lý dữ liệu nhận được từ API để khớp với cấu trúc cũ và thêm routeCoords
            const scheduleWithCoords = await Promise.all(res.data.map(async trip => {
                // Lấy chi tiết route để có tọa độ cho polyline
                const detailsRes = await axios.get(`${API_URL}/driver/schedule/${trip.ScheduleID}/details`, getAuthHeaders());
                const routeDetails = detailsRes.data;

                // Chuẩn bị dữ liệu cho Front-end
                return {
                    schedule_id: trip.ScheduleID,
                    route_name: trip.RouteName,
                    bus_plate: trip.PlateNumber,
                    departure_time: trip.DepartureTime, // Đã fix ở Backend là HH:MM
                    status: trip.Status.toLowerCase(),
                    // Tọa độ tuyến đường: lấy từ các Stop đã sắp xếp
                    routeCoords: routeDetails.stops.map(stop => [stop.Latitude, stop.Longitude]),
                    // Danh sách Stops (Giữ nguyên tên biến cũ trong FE)
                    stops: routeDetails.stops.map(stop => ({
                        id: stop.StopID,
                        name: stop.StopName,
                        coords: [stop.Latitude, stop.Longitude],
                        is_pickup: stop.IsPickup,
                        is_dropoff: stop.IsDropoff,
                        // Học sinh cần đón tại trạm này (Chỉ hiển thị học sinh status pending)
                        students_here: (stop.students_here || []).map(s => ({
                            id: s.StudentID,
                            name: s.FullName,
                            status: 'pending', // Giả định tất cả đều pending ban đầu
                            pickup_stop_id: s.PickupStopID
                        }))
                    }))
                };
            }));

            setDailySchedule(scheduleWithCoords);
            setAppState('view_schedule');
        } catch (error) {
            console.error("Lỗi tải lịch làm việc:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                setAppState('login'); // Token hết hạn/không hợp lệ
            } else {
                setAppState('error');
            }
        }
    };

    useEffect(() => {
        if (auth.token) {
            fetchDailySchedule();
        } else {
            setAppState('login');
        }
    }, [auth.token]);


    // ********************************************************
    // 2. LOGIC MÔ PHỎNG GPS NÂNG CAO
    // ********************************************************

    // Hàm chạy mô phỏng di chuyển mượt mà
    const startMovementSimulation = (trip) => {
        if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);

        // Vòng lặp chính để gửi vị trí
        gpsIntervalRef.current = setInterval(() => {
            const { segmentIndex, totalSteps, step } = movementRef.current;

            // 1. Kiểm tra nếu đã đến trạm cuối cùng của chuyến đi (Điểm đến cuối cùng)
            if (segmentIndex >= trip.stops.length - 1) {
                // Nếu đang ở trạm cuối, dừng di chuyển và chờ hành động kết thúc chuyến
                clearInterval(gpsIntervalRef.current);
                console.log('Đã đến điểm đến cuối cùng.');
                return;
            }

            const startCoords = trip.routeCoords[segmentIndex];
            const endCoords = trip.routeCoords[segmentIndex + 1];

            // 2. Tính toán vị trí mới
            const newPos = interpolate(startCoords, endCoords, step + 1, totalSteps);
            setDriverPosition(newPos);
            // TODO: GỌI API POST /api/driver/location (Sử dụng Websocket trong thực tế)
            console.log(`Gửi tọa độ GPS: [${newPos[0].toFixed(5)}, ${newPos[1].toFixed(5)}]`);

            // 3. Cập nhật bước di chuyển
            movementRef.current.step++;

            // 4. Khi đến gần trạm dừng
            if (movementRef.current.step >= totalSteps) {
                clearInterval(gpsIntervalRef.current); // Dừng lại ở trạm
                movementRef.current.step = 0; // Reset bước
                movementRef.current.segmentIndex++; // Chuẩn bị cho segment tiếp theo

                // Cập nhật currentStopIndex chỉ khi đến một trạm mới
                // Tọa độ END_COORDS của segment hiện tại chính là tọa độ START_COORDS của segment tiếp theo (trạm đón)
                if (segmentIndex + 1 < trip.stops.length) {
                    setCurrentStopIndex(segmentIndex + 1);
                    console.log(`*** ĐÃ ĐẾN TRẠM: ${trip.stops[segmentIndex + 1].name} ***`);
                    // TODO: GỌI API POST /api/driver/trip/arrive-stop
                }
            }

        }, 500); // Gửi vị trí mỗi 1 giây (để mô phỏng mượt mà, thực tế nên là 5-15s)
    };

    // Dừng gửi GPS khi appState thay đổi
    useEffect(() => {
        if (appState !== 'in_progress' && gpsIntervalRef.current) {
            console.log("Dừng gửi GPS.");
            clearInterval(gpsIntervalRef.current);
            gpsIntervalRef.current = null;
        }
    }, [appState]);

    // ********************************************************
    // 3. HÀM XỬ LÝ SỰ KIỆN API
    // ********************************************************

    // Xử lý Login
    const handleLogin = async (usernameParam, passwordParam) => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { username: usernameParam, password: passwordParam });
            localStorage.setItem('jwt_token', res.data.token);
            localStorage.setItem('driver_full_name', res.data.FullName || '');
            setAuth({ token: res.data.token, driverId: res.data.DriverID, fullName: res.data.FullName });
            // Sau khi setAuth, useEffect sẽ gọi fetchDailySchedule
        } catch (error) {
            alert("Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập/mật khẩu.");
            console.error("Lỗi đăng nhập:", error);
        }
    };

    // Hàm chọn chuyến
    const handleSelectTrip = async (trip) => {
        setSelectedTrip(trip);
        // Lấy danh sách học sinh ban đầu từ chi tiết chuyến đi đã fetch
        const allStudents = trip.stops.flatMap(stop => stop.students_here);
        setStudentsOnTrip(allStudents);
        setAppState('trip_details');

        // Đặt vị trí tài xế tại điểm xuất phát
        setDriverPosition(trip.routeCoords ? trip.routeCoords[0] : null);
    };

    // Bắt đầu chuyến đi (Gọi API)
    const handleStartTrip = async () => {
        if (!selectedTrip) return;
        try {
            await axios.post(`${API_URL}/driver/trip/${selectedTrip.schedule_id}/start`, {}, getAuthHeaders());

            // Reset trạng thái mô phỏng
            movementRef.current = { step: 0, totalSteps: 30, segmentIndex: 0 };

            // Trạm đầu tiên (xuất phát) là index 0. Trạm đón đầu tiên thường là index 1.
            setCurrentStopIndex(0);
            setAppState('in_progress');
            setDailySchedule(prev => prev.map(s => s.schedule_id === selectedTrip.schedule_id ? { ...s, status: 'in_progress' } : s));

            // Bắt đầu di chuyển ngay sau khi nhấn Start
            startMovementSimulation(selectedTrip);

        } catch (error) {
            console.error("Lỗi khi bắt đầu chuyến:", error);
            alert("Không thể bắt đầu chuyến đi. Vui lòng thử lại.");
        }
    };

    // Rời trạm hiện tại (Gọi API)
    const handleNextStop = async () => {
        if (!selectedTrip) return;

        const isLastStop = currentStopIndex === selectedTrip.stops.length - 1;

        if (isLastStop) {
            handleFinishTrip();
            return;
        }

        try {
            // TODO: GỌI API BÁO CÁO RỜI TRẠM
            // await axios.post(`${API_URL}/driver/trip/${selectedTrip.schedule_id}/next-stop`, { stopId: selectedTrip.stops[currentStopIndex].id }, getAuthHeaders());

            console.log(`Đã báo cáo rời trạm: ${selectedTrip.stops[currentStopIndex].name}`);

            // Tiếp tục di chuyển mượt mà đến trạm tiếp theo
            startMovementSimulation(selectedTrip);

            // currentStopIndex sẽ được tự động cập nhật bên trong startMovementSimulation khi đến nơi

        } catch (error) {
            console.error("Lỗi khi rời trạm:", error);
            alert("Không thể rời trạm. Vui lòng thử lại.");
        }
    };

    // Kết thúc chuyến đi (Gọi API)
    const handleFinishTrip = async () => {
        if (!selectedTrip) return;
        try {
            // TODO: GỌI API KẾT THÚC CHUYẾN
            // await axios.post(`${API_URL}/driver/trip/${selectedTrip.schedule_id}/finish`, {}, getAuthHeaders());

            console.log("Hoàn thành chuyến đi.");
            setAppState('completed');
            setDailySchedule(prev => prev.map(s => s.schedule_id === selectedTrip.schedule_id ? { ...s, status: 'completed' } : s));

        } catch (error) {
            console.error("Lỗi khi kết thúc chuyến:", error);
            alert("Không thể kết thúc chuyến đi. Vui lòng thử lại.");
        }
    };

    // Check-in học sinh (Gọi API)
    const handleCheckIn = (studentId) => {
        // TODO: GỌI API Check-in/Check-out (Gửi studentId, status='ON_BUS')
        // Gửi thông báo cho phụ huynh (Logic ở Backend)
        setStudentsOnTrip(prevStudents =>
            prevStudents.map(student => student.id === studentId ? { ...student, status: 'on_bus' } : student)
        );
        console.log(`Đã đón học sinh ${studentId}`);
    };

    // Vắng mặt học sinh (Gọi API)
    const handleMarkAbsent = (studentId) => {
        // TODO: GỌI API Báo vắng mặt (Gửi studentId, status='ABSENT')
        // Gửi thông báo cho phụ huynh (Logic ở Backend)
        setStudentsOnTrip(prevStudents =>
            prevStudents.map(student => student.id === studentId ? { ...student, status: 'absent' } : student)
        );
        console.log(`Học sinh ${studentId} vắng mặt`);
    };

    // Gửi cảnh báo (Gọi API)
    const handleSendAlert = () => {
        if (appState !== 'in_progress') {
            alert("Vui lòng bắt đầu chuyến đi trước khi gửi cảnh báo.");
            return;
        }
        // Cho phép mở modal ngay cả khi driverPosition chưa có (ví dụ vừa start)
        setIsAlertModalOpen(true);
    };


    // ********************************************************
    // 4. RENDER CÁC TRẠNG THÁI
    // ********************************************************

    // Màn hình Login
    if (appState === 'login') {
        return (
            <div className="loginContainer">
                <div className="card">
                    <h2>Đăng nhập Hệ thống SSB 1.0</h2>
                    <input type="text" placeholder="Tên đăng nhập (driver_a, driver_b, driver_c)" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" placeholder="Mật khẩu (123456)" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button className="btn btnStart" onClick={() => handleLogin(username, password)}>ĐĂNG NHẬP</button>
                </div>
            </div>
        );
    }

    // Màn hình Loading/Error
    if (appState === 'loading' || appState === 'error') {
        return (
            <div className="card">
                <h2>{appState === 'loading' ? 'Đang tải dữ liệu...' : 'Lỗi tải dữ liệu. Vui lòng thử lại.'}</h2>
            </div>
        );
    }


    // --- RENDER PHẦN GIAO DIỆN BÊN PHẢI ---
    const renderControlContent = () => {
        // Màn hình xem lịch trình
        if (appState === 'view_schedule') {
            return (
                <div className="card">
                    <h2 className="scheduleTitle"><FaListAlt /> Lịch làm việc hôm nay</h2>
                    {dailySchedule.length === 0 && <p>Không có chuyến đi nào được giao hôm nay.</p>}
                    {dailySchedule.map(trip => (
                        <div key={trip.schedule_id} className="scheduleItem">
                            <div>
                                <p className="scheduleTime">{trip.departure_time}</p>
                                <p className="scheduleRoute">{trip.route_name}</p>
                                <p className="scheduleBus">Xe: {trip.bus_plate}</p>
                            </div>
                            {trip.status !== 'completed' ? (
                                <button className="btnSm btnSelect" onClick={() => handleSelectTrip(trip)}>
                                    Xem <FaArrowRight />
                                </button>
                            ) : (
                                <span className="statusCompleted"><FaCheckCircle /> Đã xong</span>
                            )}
                        </div>
                    ))}
                    <button className="btn btnBack" onClick={() => {
                        localStorage.removeItem('jwt_token');
                        setAuth({ token: null, driverId: null, fullName: null });
                        setAppState('login');
                    }}>ĐĂNG XUẤT</button>
                </div>
            );
        }

        // Màn hình chi tiết chuyến
        if (appState === 'trip_details' && selectedTrip) {
            return (
                <div className="card">
                    <div className="tripInfo">
                        <FaBus className="busIcon" />
                        <h2>Chi tiết chuyến đi</h2>
                        <p className="routeName">{selectedTrip.route_name}</p>
                        <p>Giờ khởi hành: <strong>{selectedTrip.departure_time}</strong></p>
                        <p>Biển số xe: <strong>{selectedTrip.bus_plate}</strong></p>
                        <p>Tổng số trạm: <strong>{selectedTrip.stops.length}</strong></p>
                    </div>
                    <button className="btn btnStart" onClick={handleStartTrip}>
                        <FaHourglassStart /> BẮT ĐẦU CHUYẾN ĐI
                    </button>
                    <button className="btn btnBack" onClick={() => setAppState('view_schedule')}>
                        Xem lại lịch
                    </button>
                </div>
            );
        }

        // Màn hình đang chạy
        if (appState === 'in_progress' && selectedTrip) {
            const currentStop = selectedTrip.stops[currentStopIndex];
            const isLastStop = currentStopIndex === selectedTrip.stops.length - 1;

            // Lọc học sinh cần đón/trả
            // Học sinh cần ĐÓN tại trạm hiện tại (status 'pending' và stop_id khớp)
            const studentsToCheckIn = studentsOnTrip.filter(s => s.pickup_stop_id === currentStop.id && s.status === 'pending');
            // Học sinh cần TRẢ (chỉ ở trạm cuối và status là 'on_bus')
            const studentsToDropOff = isLastStop ? studentsOnTrip.filter(s => s.status === 'on_bus') : [];

            // Kiểm tra xem xe có đang dừng tại trạm đón (index > 0) không
            const isCurrentlyAtStop = currentStopIndex > 0 && movementRef.current.step === 0;

            return (
                <div className="card">
                    <div className="stopHeader">
                        {isLastStop ? <FaSchool /> : <FaMapMarkerAlt />}
                        <div>
                            <span className="stopLabel">{isLastStop ? "TRẠM CUỐI (TRẢ)" : "TRẠM TIẾP THEO (ĐÓN)"} ({currentStopIndex + 1}/{selectedTrip.stops.length})</span>
                            <h2 className="stopName">{currentStop.name}</h2>
                        </div>
                    </div>

                    {/* Hộp thông báo đang di chuyển */}
                    {!isCurrentlyAtStop && (
                        <div className="infoBox moving">
                            <FaBus /> Xe đang di chuyển đến trạm này...
                        </div>
                    )}

                    {/* Hiển thị danh sách học sinh chỉ khi xe dừng */}
                    {isCurrentlyAtStop && (
                        <div className="studentList">
                            {/* Học sinh cần ĐÓN */}
                            {currentStop.is_pickup && studentsToCheckIn.length > 0 && (
                                <>
                                    <h3 className="studentListTitle">Cần đón tại trạm này</h3>
                                    {studentsToCheckIn.map(student => (
                                        <div key={student.id} className="studentItem pickup">
                                            <span className="studentName">{student.name}</span>
                                            <div className="studentActions">
                                                <button className="btnSm btnAbsent" onClick={() => handleMarkAbsent(student.id)}><FaUserTimes /> Vắng</button>
                                                <button className="btnSm btnCheckIn" onClick={() => handleCheckIn(student.id)}><FaUserCheck /> Lên xe</button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                            {/* Học sinh cần TRẢ */}
                            {isLastStop && studentsToDropOff.length > 0 && (
                                <>
                                    <h3 className="studentListTitle">Cần trả tại trạm này (Đến trường)</h3>
                                    {studentsToDropOff.map(student => (
                                        <div key={student.id} className="studentItem dropoff">
                                            <span className="studentName">{student.name}</span>
                                            <span className="statusOnBus"><FaCheckCircle /> Đã trả</span>
                                        </div>
                                    ))}
                                </>
                            )}
                            {/* Không có ai */}
                            {!currentStop.is_pickup && !isLastStop && studentsToCheckIn.length === 0 && <p className="noStudents">Chỉ đi qua trạm này.</p>}
                            {currentStop.is_pickup && studentsToCheckIn.length === 0 && !isLastStop && <p className="noStudents">Không có học sinh cần đón tại trạm này.</p>}
                        </div>
                    )}

                    {/* Nút RỜI TRẠM chỉ hiển thị khi xe đã dừng (hoặc là trạm đầu tiên) */}
                    {(isCurrentlyAtStop || currentStopIndex === 0) && (
                        <button className="btn btnNext" onClick={handleNextStop}>
                            {isLastStop ? <><FaFlagCheckered /> KẾT THÚC CHUYẾN ĐI</> : <><FaArrowRight /> RỜI TRẠM VÀ TIẾP TỤC</>}
                        </button>
                    )}
                </div>
            );
        }

        // Màn hình hoàn thành
        if (appState === 'completed') {
            return (
                <div className="card">
                    <FaFlagCheckered className="finishIcon" />
                    <h2>Đã hoàn thành chuyến đi!</h2>
                    <p>Cảm ơn bạn đã lái xe an toàn.</p>
                    <button className="btn btnBack" onClick={() => {
                        setSelectedTrip(null);
                        setStudentsOnTrip([]);
                        setAppState('view_schedule');
                    }}>
                        Xem lịch trình
                    </button>
                </div>
            );
        }

        return <div className="card"><p>Đang tải...</p></div>;
    };

    // --- RENDER TOÀN BỘ TRANG ---
    return (
        <div className="driverPage">
            <header className="header">
                Chào, Tài xế {auth.fullName || '...'} {selectedTrip ? `| Xe: ${selectedTrip.bus_plate}` : ''}
                {/* Nút cảnh báo chỉ hiển thị khi đang chạy */}
                {appState === 'in_progress' && (
                    <button className="btnAlertHeader" onClick={handleSendAlert}>
                        <FaExclamationTriangle /> Cảnh Báo
                    </button>
                )}
            </header>
            <div className="driverLayout">
                {/* --- CỘT BẢN ĐỒ (TRÁI) --- */}
                <div className="mapColumn">
                    <MapContainer
                        // Vị trí trung tâm ban đầu: Lấy từ vị trí đầu tiên của tuyến đường, hoặc mặc định
                        center={driverPosition || [10.7629, 106.6825]}
                        zoom={14}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={true} // Cho phép cuộn để zoom
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {/* Vẽ tuyến đường */}
                        {selectedTrip?.routeCoords && (
                            <Polyline positions={selectedTrip.routeCoords} color="#1e5799" weight={5} />
                        )}

                        {/* Vẽ các trạm dừng */}
                        {selectedTrip?.stops.map((stop, index) => (
                            <Marker
                                key={stop.id}
                                position={stop.coords}
                                // Highlight trạm hiện tại nếu xe đang ở trạng thái in_progress và đang dừng tại trạm đó
                                icon={index === selectedTrip.stops.length - 1 ? schoolIcon : stopIcon(stop.id, index === currentStopIndex && appState === 'in_progress' && movementRef.current.step === 0)}
                            >
                                <Popup>
                                    <b>{index === currentStopIndex && appState === 'in_progress' ? 'Trạm Hiện Tại:' : `Trạm ${stop.id}:`}</b><br />
                                    {stop.name}
                                    {stop.is_pickup && <><br />Cần đón: {studentsOnTrip.filter(s => s.pickup_stop_id === stop.id).length} HS</>}
                                </Popup>
                            </Marker>
                        ))}

                        {/* Vẽ vị trí tài xế */}
                        {driverPosition && appState !== 'view_schedule' && (
                            <Marker position={driverPosition} icon={driverIcon}>
                                <Popup>Vị trí hiện tại của bạn</Popup>
                            </Marker>
                        )}

                        {/* Component tự động di chuyển bản đồ */}
                        {driverPosition && appState === 'in_progress' && <MapUpdater position={driverPosition} />}

                    </MapContainer>
                </div>

                {/* --- CỘT ĐIỀU KHIỂN (PHẢI) --- */}
                <div className="controlColumn">
                    {renderControlContent()}
                </div>
            </div>

            {/* Render Alert Modal (đã fix: trước đây modal không được render nên nút cảnh báo không mở) */}
            <AlertModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
                studentsOnTrip={studentsOnTrip}
                selectedTrip={selectedTrip}
                driverPosition={driverPosition}
                getAuthHeaders={getAuthHeaders}
            />
        </div>
    );
}


export default DriverPage;
