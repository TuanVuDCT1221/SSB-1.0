import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'; // Import Leaflet components
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Driver.css'; // Using regular CSS
import {
    FaBus, FaMapMarkerAlt, FaUserCheck, FaUserTimes, FaCheckCircle,
    FaHourglassStart, FaFlagCheckered, FaListAlt, FaExclamationTriangle, FaArrowRight, FaSchool, FaLocationArrow
} from 'react-icons/fa';

// --- MAPQUEST KEY (Replace with your own) ---
 // <-- **** THAY KEY CỦA BẠN VÀO ĐÂY ****

// --- DỮ LIỆU GIẢ ---
const MOCK_SCHEDULE = [
    {
        schedule_id: 101, route_name: "Tuyến Quận 12 → ĐH Sài Gòn (Sáng)", bus_plate: "51B-12345",
        departure_time: "06:00", status: 'pending',
        stops: [
            { id: 1, name: "Trạm Quận 12 - Xuất phát", coords: [10.8612, 106.6115], is_pickup: true, is_dropoff: false, students_here: [] },
            { id: 2, name: "Trạm Gò Vấp 1", coords: [10.8412, 106.6515], is_pickup: true, is_dropoff: false, students_here: [
                { id: 101, name: "Nguyễn Thị B", status: 'pending', pickup_stop_id: 2 },
                { id: 102, name: "Lê Văn E", status: 'pending', pickup_stop_id: 2 },
            ]},
            { id: 3, name: "Trạm Gò Vấp 2", coords: [10.8215, 106.6712], is_pickup: true, is_dropoff: false, students_here: [
                { id: 103, name: "Trần Minh F", status: 'pending', pickup_stop_id: 3 },
            ]},
            // ... Thêm tọa độ 'coords' cho tất cả các trạm khác ...
            { id: 21, name: "ĐH Sài Gòn - Điểm đến", coords: [10.7629, 106.6825], is_pickup: false, is_dropoff: true, students_here: [] }
        ]
    },
    // ... (Thêm chuyến chiều nếu cần)
];
// ---------------------------------------------

// --- Custom Icons (Dùng class CSS TOÀN CỤC - Đặt trong index.css) ---
const driverIcon = L.divIcon({ className: 'driver-marker', html: '<i class="fas fa-location-arrow"></i>', iconSize: [25, 25], iconAnchor: [12, 12] });
const stopIcon = (id, isCurrent = false) => L.divIcon({
    className: `stop-marker-driver ${isCurrent ? 'current' : ''}`,
    html: `<span>${id}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});
const schoolIcon = L.divIcon({ className: 'school-marker', html: '<i class="fas fa-school"></i>', iconSize: [25, 25], iconAnchor: [12, 12] });

// --- Map Updater Component ---
// Component nhỏ để tự động di chuyển bản đồ theo vị trí tài xế
function MapUpdater({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom() < 15 ? 15 : map.getZoom()); // Bay tới vị trí mới, zoom nếu cần
        }
    }, [position, map]);
    return null;
}

// --- DriverPage Component ---
function DriverPage() {
    const [dailySchedule, setDailySchedule] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [appState, setAppState] = useState('view_schedule');
    const [studentsOnTrip, setStudentsOnTrip] = useState([]);
    const [driverPosition, setDriverPosition] = useState(null); // Lưu vị trí GPS hiện tại [lat, lng]

    const gpsIntervalRef = useRef(null);
    const mapRef = useRef(null); // Ref cho MapContainer

    // Tải lịch làm việc
    useEffect(() => {
        console.log("Đang tải lịch làm việc...");
        // TODO: Gọi API GET /api/driver/schedule?date=today
        const scheduleWithCoords = MOCK_SCHEDULE.map(trip => ({
            ...trip,
            // Đảm bảo có mảng tọa độ cho polyline
            routeCoords: trip.stops.map(stop => stop.coords).filter(coords => coords),
        }));
        setDailySchedule(scheduleWithCoords);
        setAppState('view_schedule');
    }, []);

    // Bắt đầu/Dừng gửi & Mô phỏng GPS
    useEffect(() => {
        if (appState === 'in_progress' && selectedTrip) {
            console.log("Bắt đầu gửi GPS cho chuyến:", selectedTrip.schedule_id);

            // Set vị trí ban đầu
            if (selectedTrip.routeCoords && selectedTrip.routeCoords.length > 0) {
                setDriverPosition(selectedTrip.routeCoords[0]);
            }

            // Bắt đầu gửi/mô phỏng
            let simulatedStep = 0; // Biến để mô phỏng di chuyển
            gpsIntervalRef.current = setInterval(() => {
                // --- PHẦN MÔ PHỎNG --- (Thay bằng GPS thật khi có API)
                if (selectedTrip.routeCoords && simulatedStep < selectedTrip.routeCoords.length - 1) {
                    simulatedStep++;
                    const nextPos = selectedTrip.routeCoords[simulatedStep];
                    setDriverPosition(nextPos); // Cập nhật vị trí trên bản đồ
                    console.log('Mô phỏng vị trí GPS:', nextPos);
                    // TODO: Gọi API POST /api/driver/send-location gửi nextPos
                } else {
                     console.log('Đã hết lộ trình mô phỏng hoặc không có lộ trình.');
                }
                // --- KẾT THÚC MÔ PHỎNG ---

                /* // --- PHẦN LẤY GPS THẬT --- (Bỏ comment khi dùng)
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        const currentPos = [latitude, longitude];
                        setDriverPosition(currentPos); // Cập nhật vị trí trên bản đồ
                        console.log('Gửi tọa độ GPS:', currentPos);
                        // TODO: Gọi API POST /api/driver/send-location
                        // Gửi: { schedule_id: selectedTrip.schedule_id, latitude, longitude }
                    },
                    (error) => {
                        console.error("Lỗi lấy GPS:", error);
                        // TODO: Xử lý lỗi (ví dụ: thông báo cho tài xế bật GPS)
                    },
                    { enableHighAccuracy: true } // Yêu cầu độ chính xác cao
                );
                */
            }, 5000); // 5 giây 1 lần cho demo (Thực tế nên là 10-15s)

        } else {
            if (gpsIntervalRef.current) {
                console.log("Dừng gửi GPS.");
                clearInterval(gpsIntervalRef.current);
            }
        }
        return () => { if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current); };
    }, [appState, selectedTrip]);


    // --- HÀM XỬ LÝ SỰ KIỆN (Giữ nguyên logic, chỉ gọi API) ---
    const handleSelectTrip = (trip) => {
        setSelectedTrip(trip);
        const allStudents = trip.stops.flatMap(stop => stop.students_here.map(s => ({ ...s })));
        setStudentsOnTrip(allStudents);
        setAppState('trip_details');
        setDriverPosition(trip.routeCoords ? trip.routeCoords[0] : null); // Đặt vị trí ban đầu
    };
    const handleStartTrip = () => { /* ... giữ nguyên ... */
        if (!selectedTrip) return;
        console.log("Bắt đầu chuyến đi:", selectedTrip.schedule_id);
        setCurrentStopIndex(0);
        setAppState('in_progress');
        setDailySchedule(prev => prev.map(s => s.schedule_id === selectedTrip.schedule_id ? {...s, status: 'in_progress'} : s));
    };
    const handleNextStop = () => { /* ... giữ nguyên ... */
        if (!selectedTrip) return;
        const currentStop = selectedTrip.stops[currentStopIndex];
        console.log("Đã rời trạm:", currentStop.name);
        if (currentStopIndex < selectedTrip.stops.length - 1) {
            setCurrentStopIndex(prev => prev + 1);
        } else {
            handleFinishTrip();
        }
    };
    const handleFinishTrip = () => { /* ... giữ nguyên ... */
        if (!selectedTrip) return;
        console.log("Hoàn thành chuyến đi.");
        setAppState('completed');
        setDailySchedule(prev => prev.map(s => s.schedule_id === selectedTrip.schedule_id ? {...s, status: 'completed'} : s));
    };
    const handleCheckIn = (studentId) => { /* ... giữ nguyên ... */
         setStudentsOnTrip(prevStudents =>
            prevStudents.map(student => student.id === studentId ? { ...student, status: 'on_bus' } : student)
        );
        console.log(`Đã đón học sinh ${studentId}`);
    };
    const handleMarkAbsent = (studentId) => { /* ... giữ nguyên ... */
        setStudentsOnTrip(prevStudents =>
            prevStudents.map(student => student.id === studentId ? { ...student, status: 'absent' } : student)
        );
        console.log(`Học sinh ${studentId} vắng mặt`);
    };
    const handleSendAlert = () => { /* ... giữ nguyên ... */
        const reason = prompt("Nhập lý do cảnh báo:");
        if (reason) {
            console.log("!!! GỬI CẢNH BÁO:", reason, "Cho chuyến:", selectedTrip?.schedule_id);
            alert("Đã gửi cảnh báo.");
        }
    };

    // --- RENDER PHẦN GIAO DIỆN BÊN PHẢI ---
    const renderControlContent = () => {
        // Màn hình xem lịch trình
        if (appState === 'view_schedule') {
            return (
                <div className="card">
                    <h2 className="scheduleTitle"><FaListAlt /> Lịch làm việc hôm nay</h2>
                    {dailySchedule.length === 0 && <p>Không có chuyến đi nào được giao.</p>}
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
                </div>
            );
        }

        // Màn hình chi tiết chuyến (trước khi bắt đầu)
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
            const studentsToCheckIn = studentsOnTrip.filter(s => s.pickup_stop_id === currentStop.id && s.status === 'pending');
            const studentsToDropOff = isLastStop ? studentsOnTrip.filter(s => s.status === 'on_bus') : [];

            return (
                <div className="card">
                    <div className="stopHeader">
                        {isLastStop ? <FaSchool/> : <FaMapMarkerAlt />}
                        <div>
                            <span className="stopLabel">{isLastStop ? "TRẠM CUỐI (TRẢ)" : "TRẠM HIỆN TẠI (ĐÓN)"} ({currentStopIndex + 1}/{selectedTrip.stops.length})</span>
                            <h2 className="stopName">{currentStop.name}</h2>
                        </div>
                    </div>
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
                                        <span className="statusOnBus"><FaCheckCircle /> Sẵn sàng trả</span>
                                    </div>
                                ))}
                            </>
                        )}
                         {/* Không có ai */}
                        {!currentStop.is_pickup && !isLastStop && studentsToCheckIn.length === 0 && <p className="noStudents">Chỉ đi qua trạm này.</p>}
                        {currentStop.is_pickup && studentsToCheckIn.length === 0 && !isLastStop && <p className="noStudents">Không có học sinh cần đón tại trạm này.</p>}
                    </div>
                    <button className="btn btnNext" onClick={handleNextStop}>
                        {isLastStop ? <><FaFlagCheckered /> KẾT THÚC CHUYẾN ĐI</> : <><FaArrowRight /> RỜI TRẠM</>}
                    </button>
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

        return <div className="card"><p>Đang tải...</p></div>; // Trạng thái mặc định
    };

    // --- RENDER TOÀN BỘ TRANG ---
    return (
        <div className="driverPage">
            <header className="header">
                Chào, Tài xế Trần Văn C {selectedTrip ? `| Xe: ${selectedTrip.bus_plate}` : ''}
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
                        center={selectedTrip?.routeCoords?.[0] || [10.7629, 106.6825]} // Vị trí trung tâm ban đầu
                        zoom={14}
                        style={{ height: "100%", width: "100%" }}
                        ref={mapRef}
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
                                icon={stop.id === selectedTrip.stops[selectedTrip.stops.length -1].id ? schoolIcon : stopIcon(stop.id, index === currentStopIndex && appState === 'in_progress')} // Highlight trạm hiện tại
                            >
                                <Popup>
                                    <b>{index === currentStopIndex && appState === 'in_progress' ? 'Trạm Hiện Tại:' : `Trạm ${stop.id}:`}</b><br />
                                    {stop.name}
                                </Popup>
                            </Marker>
                        ))}

                        {/* Vẽ vị trí tài xế */}
                        {driverPosition && appState === 'in_progress' && (
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
        </div>
    );
}

export default DriverPage;