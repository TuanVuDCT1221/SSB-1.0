import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Parent.css'; // SỬ DỤNG CSS THƯỜNG
import { FaBus, FaInfoCircle, FaPlay, FaRedo, FaBusAlt, FaRoute, FaMapMarkerAlt, FaBell } from 'react-icons/fa';

// --- Dữ liệu tĩnh ---
const universityLocation = [10.7629, 106.6825];
const busStops = [
    { id: 1, name: "Trạm Quận 12 - Xuất phát", address: "QL22, P. Trung Mỹ Tây, Q. 12", coords: [10.8612, 106.6115], roadPath: [[10.8612, 106.6115], [10.856, 106.616], [10.851, 106.621], [10.846, 106.626]] },
    { id: 2, name: "Trạm Gò Vấp 1", address: "QL1, P. 15, Q. Gò Vấp", coords: [10.8412, 106.6515], roadPath: [[10.846, 106.626], [10.844, 106.631], [10.842, 106.636], [10.8412, 106.6515]] },
    { id: 3, name: "Trạm Gò Vấp 2", address: "QL1, P. 7, Q. Gò Vấp", coords: [10.8215, 106.6712], roadPath: [[10.8412, 106.6515], [10.836, 106.656], [10.831, 106.661], [10.826, 106.666], [10.8215, 106.6712]] },
    { id: 4, name: "Trạm Tân Bình 1", address: "QL1, P. 2, Q. Tân Bình", coords: [10.8012, 106.6815], roadPath: [[10.8215, 106.6712], [10.816, 106.674], [10.811, 106.677], [10.806, 106.679], [10.8012, 106.6815]] },
    { id: 5, name: "Trạm Tân Bình 2", address: "QL1, P. 4, Q. Tân Bình", coords: [10.7915, 106.6712], roadPath: [[10.8012, 106.6815], [10.798, 106.678], [10.794, 106.675], [10.7915, 106.6712]] },
    { id: 6, name: "Trạm Phú Nhuận 1", address: "Điện Biên Phủ, P. 15, Q. Phú Nhuận", coords: [10.7812, 106.6815], roadPath: [[10.7915, 106.6712], [10.788, 106.673], [10.784, 106.676], [10.7812, 106.6815]] },
    { id: 7, name: "Trạm Phú Nhuận 2", address: "Điện Biên Phủ, P. 10, Q. Phú Nhuận", coords: [10.7715, 106.6912], roadPath: [[10.7812, 106.6815], [10.778, 106.684], [10.774, 106.687], [10.7715, 106.6912]] },
    { id: 8, name: "Trạm Bình Thạnh 1", address: "Điện Biên Phủ, P. 14, Q. Bình Thạnh", coords: [10.8012, 106.7145], roadPath: [[10.7715, 106.6912], [10.776, 106.698], [10.783, 106.705], [10.791, 106.710], [10.8012, 106.7145]] },
    { id: 9, name: "Trạm Bình Thạnh 2", address: "Điện Biên Phủ, P. 7, Q. Bình Thạnh", coords: [10.7915, 106.7012], roadPath: [[10.8012, 106.7145], [10.798, 106.710], [10.794, 106.706], [10.7915, 106.7012]] },
    { id: 10, name: "Trạm Quận 3", address: "Cách Mạng Tháng 8, P. Võ Thị Sáu, Q. 3", coords: [10.7812, 106.6915], roadPath: [[10.7915, 106.7012], [10.788, 106.698], [10.784, 106.694], [10.7812, 106.6915]] },
    { id: 11, name: "Trạm Quận 1 - Bến Thành", address: "Lê Lợi, P. Bến Thành, Q. 1", coords: [10.7736, 106.6984], roadPath: [[10.7812, 106.6915], [10.778, 106.694], [10.775, 106.696], [10.7736, 106.6984]] },
    { id: 12, name: "Trạm Quận 5 - Chợ Lớn", address: "Nguyễn Trãi, P. 11, Q. 5", coords: [10.7502, 106.6654], roadPath: [[10.7736, 106.6984], [10.768, 106.688], [10.762, 106.678], [10.756, 106.671], [10.7502, 106.6654]] },
    { id: 13, name: "Trạm Q.10 - CV Lê Thị Riêng", address: "CMT8, P. 12, Q. 10", coords: [10.7815, 106.6689], roadPath: [[10.7502, 106.6654], [10.755, 106.666], [10.765, 106.667], [10.775, 106.668], [10.7815, 106.6689]] },
    { id: 14, name: "Trạm Quận 11", address: "Lạc Long Quân, P. 16, Q. 11", coords: [10.7742, 106.6415], roadPath: [[10.7815, 106.6689], [10.779, 106.658], [10.777, 106.649], [10.7742, 106.6415]] },
    { id: 15, name: "Trạm Tân Phú", address: "Lũy Bán Bích, P. Tân Sơn Nhì, Q. Tân Phú", coords: [10.7912, 106.6315], roadPath: [[10.7742, 106.6415], [10.778, 106.638], [10.783, 106.635], [10.788, 106.633], [10.7912, 106.6315]] },
    { id: 16, name: "Trạm Bình Tân", address: "Kinh Dương Vương, P. Bình Hưng Hòa, Q. Bình Tân", coords: [10.7915, 106.6012], roadPath: [[10.7912, 106.6315], [10.791, 106.626], [10.791, 106.616], [10.7915, 106.6012]] },
    { id: 17, name: "Trạm ĐH Bách Khoa", address: "Đại học Bách Khoa TP.HCM", coords: [10.7732, 106.6597], roadPath: [[10.7915, 106.6012], [10.785, 106.621], [10.779, 106.641], [10.7732, 106.6597]] },
    { id: 18, name: "Trạm ĐH Kinh tế", address: "Đại học Kinh tế TP.HCM", coords: [10.7745, 106.6798], roadPath: [[10.7732, 106.6597], [10.773, 106.664], [10.773, 106.669], [10.774, 106.674], [10.7745, 106.6798]] },
    { id: 19, name: "Trạm ĐH Y Dược", address: "Đại học Y Dược TP.HCM", coords: [10.7721, 106.6723], roadPath: [[10.7745, 106.6798], [10.773, 106.676], [10.7721, 106.6723]] },
    { id: 20, name: "Trạm ĐH Sư phạm", address: "Đại học Sư phạm TP.HCM", coords: [10.7734, 106.6676], roadPath: [[10.7721, 106.6723], [10.772, 106.670], [10.773, 106.668], [10.7734, 106.6676]] },
    { id: 21, name: "ĐH Sài Gòn - Điểm đến", address: "273 An Dương Vương, Quận 5", coords: universityLocation, roadPath: [[10.7734, 106.6676], [10.770, 106.672], [10.766, 106.677], [10.7629, 106.6825]] }
];

const allRouteCoords = busStops.reduce((acc, stop, index) => {
    if (index > 0) acc.push(...busStops[index - 1].roadPath);
    if (index === busStops.length - 1) acc.push(...stop.roadPath);
    return acc;
}, []);

// --- Custom Icons (Dùng class CSS TOÀN CỤC) ---
const busIcon = L.divIcon({ className: 'bus-marker', html: '<i class="fas fa-bus"></i>', iconSize: [30, 30], iconAnchor: [15, 15] });
const schoolIcon = L.divIcon({ className: 'school-marker', html: '<i class="fas fa-university"></i>', iconSize: [25, 25], iconAnchor: [12, 12] });

function ParentPage() {
    
    // --- State ---
    const [busInfo, setBusInfo] = useState({
        busNumber: '51B-12345',
        driver: 'Trần Văn C',
        statusText: 'Đang chờ',
        statusClass: 'status-stopped', // LƯU TÊN CLASS CSS
        speed: '--',
        timeRemaining: '--',
        distanceRemaining: '--',
        currentStop: '--'
    });
    
    const [studentStatus, setStudentStatus] = useState({
        text: 'Đang trên xe',
        className: 'status-on-bus' // LƯU TÊN CLASS CSS
    });

    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Hệ thống đã sẵn sàng', message: 'Tuyến đường 21 trạm từ Q.12 về ĐH Sài Gòn đã sẵn sàng.', time: 'Vừa xong' }
    ]);

    const [activeStopId, setActiveStopId] = useState(null);
    const [isRouteActive, setIsRouteActive] = useState(false);

    // --- Refs ---
    const mapRef = useRef(null);
    const busMarkerRef = useRef(null);
    const busIntervalRef = useRef(null);
    const currentStepRef = useRef(0);

    // --- Hàm thêm thông báo ---
    const addNotification = (title, message, type = 'info') => {
        const newNotif = {
            id: Date.now(),
            title,
            message,
            time: new Date().toLocaleTimeString('vi-VN'),
            type
        };
        setNotifications(prev => [newNotif, ...prev.slice(0, 7)]);
    };

    // --- Khởi tạo bản đồ ---
    useEffect(() => {
        if (mapRef.current) return; 

        mapRef.current = L.map('parent-map-container').setView([10.8012, 106.6815], 13);
        const map = mapRef.current;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        L.marker(universityLocation, { icon: schoolIcon })
            .addTo(map)
            .bindPopup('<b>Đại học Sài Gòn</b><br>Điểm đến cuối cùng')
            .openPopup();
        
        busMarkerRef.current = L.marker(busStops[0].coords, {
            icon: busIcon,
            opacity: 0
        }).addTo(map).bindPopup('<b>Xe buýt ĐH Sài Gòn</b>');

        const routeLine = L.polyline(allRouteCoords, {
            color: '#1e5799', weight: 6, opacity: 0.7
        }).addTo(map);

        busStops.forEach((stop, index) => {
            const isFirstStop = index === 0;
            const isLastStop = index === busStops.length - 1;
            
            L.marker(stop.coords, {
                icon: L.divIcon({
                    className: isLastStop ? 'school-marker' : 'stop-marker',
                    html: isLastStop ? '<i class="fas fa-university"></i>' : 
                          isFirstStop ? '<i class="fas fa-play"></i>' : 
                          `<span style="font-size:8px">${stop.id}</span>`,
                    iconSize: isLastStop ? [25, 25] : [20, 20],
                    iconAnchor: isLastStop ? [12, 12] : [10, 10]
                })
            }).addTo(map).bindPopup(`<b>Trạm ${stop.id}: ${stop.name}</b><br>${stop.address}`);
        });

        map.fitBounds(routeLine.getBounds());

        return () => {
            if (busIntervalRef.current) {
                clearInterval(busIntervalRef.current);
            }
        };
    }, []); 

    
    // --- Các hàm logic (giữ nguyên) ---
    const findNearestStop = (position) => {
        let nearestStop = null;
        let minDistance = Infinity;
        busStops.forEach(stop => {
            const distance = L.latLng(position).distanceTo(L.latLng(stop.coords));
            if (distance < minDistance && distance < 500) {
                minDistance = distance;
                nearestStop = stop;
            }
        });
        return nearestStop;
    };

    const updateBusDisplayInfo = () => {
        const progress = currentStepRef.current / allRouteCoords.length;
        const remainingTime = Math.round(112 * (1 - progress));
        const remainingDistance = (25 * (1 - progress)).toFixed(1);

        setBusInfo(prev => ({
            ...prev,
            speed: `${25 + Math.floor(Math.random() * 20)}`,
            timeRemaining: remainingTime,
            distanceRemaining: remainingDistance,
        }));
    };

    const moveBus = () => {
        currentStepRef.current += 1;
        const step = currentStepRef.current;

        if (step >= allRouteCoords.length - 1) {
            finishRoute();
            return;
        }

        const newPosition = allRouteCoords[step];
        if (busMarkerRef.current) {
            busMarkerRef.current.setLatLng(newPosition);
        }

        if (step % 200 === 0) {
            updateBusDisplayInfo();
            
            const nearestStop = findNearestStop(newPosition);
            if (nearestStop && nearestStop.id !== activeStopId) {
                setActiveStopId(nearestStop.id);
                setBusInfo(prev => ({ ...prev, currentStop: nearestStop.name }));
                addNotification("Đến trạm", `Xe buýt đã đến: ${nearestStop.name}`);
            }
        }
    };

    const startRoute = () => {
        if (isRouteActive) return;
        setIsRouteActive(true);
        currentStepRef.current = 0;
        
        busMarkerRef.current.setOpacity(1);
        busMarkerRef.current.setLatLng(busStops[0].coords);

        setBusInfo({
            busNumber: `51B-${Math.floor(10000 + Math.random() * 90000)}`,
            driver: 'Trần Văn C',
            statusText: 'Đang di chuyển',
            statusClass: 'status-moving', // LƯU TÊN CLASS CSS
            speed: '30',
            timeRemaining: '112',
            distanceRemaining: '25.0',
            currentStop: busStops[0].name
        });
        setActiveStopId(busStops[0].id);
        addNotification("Bắt đầu tuyến đường", "Xe buýt đã xuất phát từ Quận 12.");

        if (busIntervalRef.current) clearInterval(busIntervalRef.current);
        busIntervalRef.current = setInterval(moveBus, 170);
    };

    const finishRoute = () => {
        if (busIntervalRef.current) clearInterval(busIntervalRef.current);
        setIsRouteActive(false);

        setBusInfo(prev => ({
            ...prev,
            statusText: 'Đã đến nơi',
            statusClass: 'status-stopped', // LƯU TÊN CLASS CSS
            speed: '0',
            timeRemaining: '0',
            distanceRemaining: '0',
            currentStop: busStops[busStops.length - 1].name
        }));
        setStudentStatus({ text: 'Đã đến trường', className: 'status-at-school' });
        setActiveStopId(busStops.length - 1);
        addNotification("Hoàn thành", "Xe buýt đã đến ĐH Sài Gòn an toàn.", 'success');
    };

    const resetRoute = () => {
        if (busIntervalRef.current) clearInterval(busIntervalRef.current);
        setIsRouteActive(false);
        currentStepRef.current = 0;

        if(busMarkerRef.current) busMarkerRef.current.setOpacity(0);
        
        setBusInfo({
            busNumber: '51B-12345',
            driver: 'Trần Văn C',
            statusText: 'Đang chờ',
            statusClass: 'status-stopped', // LƯU TÊN CLASS CSS
            speed: '--',
            timeRemaining: '--',
            distanceRemaining: '--',
            currentStop: '--'
        });
        setStudentStatus({ text: 'Đang trên xe', className: 'status-on-bus' });
        setActiveStopId(null);
        addNotification("Đã đặt lại", "Hệ thống đã được đặt lại trạng thái ban đầu.");
    };

    const handleLocateBus = () => {
        if (isRouteActive && busMarkerRef.current && mapRef.current) {
            mapRef.current.flyTo(busMarkerRef.current.getLatLng(), 15);
        } else if (mapRef.current) {
            mapRef.current.flyTo(universityLocation, 14);
        }
    };

    const handleStopClick = (stop) => {
        if (mapRef.current) {
            mapRef.current.flyTo(stop.coords, 15);
            setActiveStopId(stop.id);
        }
    };

    // --- JSX (Render Giao diện) ---
    return (
        <div className="page-wrapper"> {/* SỬ DỤNG CLASS THƯỜNG */}
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo">
                            <FaBus />
                            <h1>Hệ thống xe buýt ĐH Sài Gòn</h1>
                        </div>
                        <div className="user-info">
                            <img src="https://i.pravatar.cc/150?img=12" alt="Phụ huynh" />
                            <div>
                                <div>Chào, Nguyễn Văn A</div>
                                <div>Học sinh: Nguyễn Thị B - Lớp 3A</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container">
                <div className="alert alert-info">
                    <FaInfoCircle />
                    <div>
                        <strong>Tuyến đường thực tế:</strong> 21 trạm từ Quận 12 về ĐH Sài Gòn
                    </div>
                </div>

                <div className="main-content">
                    <div className="map-container">
                        <div id="parent-map-container" style={{ height: '100%', width: '100%' }}></div>
                        <div className="map-controls">
                            <button onClick={startRoute} className="btn-success">
                                <FaPlay /> Bắt đầu
                            </button>
                            <button onClick={handleLocateBus}><FaBus /> Định vị</button>
                            <button onClick={resetRoute} className="btn-warning">
                                <FaRedo /> Đặt lại
                            </button>
                        </div>
                    </div>

                    <div className="sidebar">
                        <div className="card">
                            <h2><FaBusAlt /> Thông tin xe buýt</h2>
                            <div className="bus-info">
                                <div className="info-item">
                                    <span className="info-label">Biển số xe:</span>
                                    <span className="info-value">{busInfo.busNumber}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Tài xế:</span>
                                    <span className="info-value">{busInfo.driver}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Trạng thái:</span>
                                    <span className="info-value">
                                        {/* Dùng template literal để ghép class */}
                                        <span className={`status-indicator ${busInfo.statusClass}`}></span>
                                        {busInfo.statusText}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Tốc độ:</span>
                                    <span className="info-value">{busInfo.speed} km/h</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Thời gian còn lại:</span>
                                    <span className="info-value">{busInfo.timeRemaining} phút</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Khoảng cách:</span>
                                    <span className="info-value">{busInfo.distanceRemaining} km</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Trạm hiện tại:</span>
                                    <span className="info-value">{busInfo.currentStop}</span>
                                </div>
                                <div className="student-status">
                                    <span className="info-label">Tình trạng học sinh:</span>
                                    <span className={`status-badge ${studentStatus.className}`}>
                                        {studentStatus.text}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h2><FaMapMarkerAlt /> Danh sách trạm (21)</h2>
                            <div className="stops-list">
                                {busStops.map(stop => (
                                    <div 
                                        key={stop.id} 
                                        className={`stop-item ${stop.id === activeStopId ? 'active' : ''}`}
                                        onClick={() => handleStopClick(stop)}
                                    >
                                        <div className="stop-number">{stop.id}</div>
                                        <div className="stop-info">
                                            <div className="stop-name">{stop.name}</div>
                                            <div className="stop-address">{stop.address}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card">
                            <h2><FaBell /> Thông báo</h2>
                            <div className="notifications">
                                {notifications.map(notif => (
                                    <div key={notif.id} className={`notification-item ${notif.type === 'success' ? 'notification-success' : ''}`}>
                                        <div><strong>{notif.title}</strong></div>
                                        <div>{notif.message}</div>
                                        <div className="notification-time">{notif.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="container">
                    <p>Hệ thống theo dõi xe buýt ĐH Sài Gòn &copy; 2025.</p>
                </div>
            </footer>
        </div>
    );
}

export default ParentPage;