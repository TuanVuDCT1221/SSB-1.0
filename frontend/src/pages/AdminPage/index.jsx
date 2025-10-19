import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Admin.css';

import {
    FaTachometerAlt, FaBus, FaUserGraduate, FaIdCard,
    FaCalendarAlt, FaRoute, FaPlay, FaRedo, FaMapMarkerAlt
} from 'react-icons/fa';

const universityLocation = [10.7629, 106.6825];
const busStops = [
    { id: 1, name: "Trạm Quận 12 - Xuất phát", address: "QL22, Phường Trung Mỹ Tây, Quận 12", coords: [10.8612, 106.6115], roadPath: [[10.8612, 106.6115], [10.856, 106.616], [10.851, 106.621], [10.846, 106.626]] },
    { id: 2, name: "Trạm Gò Vấp 1", address: "QL1, Phường 15, Quận Gò Vấp", coords: [10.8412, 106.6515], roadPath: [[10.846, 106.626], [10.844, 106.631], [10.842, 106.636], [10.8412, 106.6515]] },
    { id: 3, name: "Trạm Gò Vấp 2", address: "QL1, Phường 7, Quận Gò Vấp", coords: [10.8215, 106.6712], roadPath: [[10.8412, 106.6515], [10.836, 106.656], [10.831, 106.661], [10.826, 106.666], [10.8215, 106.6712]] },
    { id: 4, name: "Trạm Tân Bình 1", address: "QL1, Phường 2, Quận Tân Bình", coords: [10.8012, 106.6815], roadPath: [[10.8215, 106.6712], [10.816, 106.674], [10.811, 106.677], [10.806, 106.679], [10.8012, 106.6815]] },
    { id: 5, name: "Trạm Tân Bình 2", address: "QL1, Phường 4, Quận Tân Bình", coords: [10.7915, 106.6712], roadPath: [[10.8012, 106.6815], [10.798, 106.678], [10.794, 106.675], [10.7915, 106.6712]] },
    { id: 6, name: "Trạm Phú Nhuận 1", address: "Điện Biên Phủ, Phường 15, Quận Phú Nhuận", coords: [10.7812, 106.6815], roadPath: [[10.7915, 106.6712], [10.788, 106.673], [10.784, 106.676], [10.7812, 106.6815]] },
    { id: 7, name: "Trạm Phú Nhuận 2", address: "Điện Biên Phủ, Phường 10, Quận Phú Nhuận", coords: [10.7715, 106.6912], roadPath: [[10.7812, 106.6815], [10.778, 106.684], [10.774, 106.687], [10.7715, 106.6912]] },
    { id: 8, name: "Trạm Bình Thạnh 1", address: "Điện Biên Phủ, Phường 14, Quận Bình Thạnh", coords: [10.8012, 106.7145], roadPath: [[10.7715, 106.6912], [10.776, 106.698], [10.783, 106.705], [10.791, 106.710], [10.8012, 106.7145]] },
    { id: 9, name: "Trạm Bình Thạnh 2", address: "Điện Biên Phủ, Phường 7, Quận Bình Thạnh", coords: [10.7915, 106.7012], roadPath: [[10.8012, 106.7145], [10.798, 106.710], [10.794, 106.706], [10.7915, 106.7012]] },
    { id: 10, name: "Trạm Quận 3", address: "Cách Mạng Tháng 8, Phường Võ Thị Sáu, Quận 3", coords: [10.7812, 106.6915], roadPath: [[10.7915, 106.7012], [10.788, 106.698], [10.784, 106.694], [10.7812, 106.6915]] },
    { id: 11, name: "Trạm Quận 1 - Bến Thành", address: "Lê Lợi, Phường Bến Thành, Quận 1", coords: [10.7736, 106.6984], roadPath: [[10.7812, 106.6915], [10.778, 106.694], [10.775, 106.696], [10.7736, 106.6984]] },
    { id: 12, name: "Trạm Quận 5 - Chợ Lớn", address: "Nguyễn Trãi, Phường 11, Quận 5", coords: [10.7502, 106.6654], roadPath: [[10.7736, 106.6984], [10.768, 106.688], [10.762, 106.678], [10.756, 106.671], [10.7502, 106.6654]] },
    { id: 13, name: "Trạm Quận 10 - Công viên Lê Thị Riêng", address: "Cách Mạng Tháng 8, Phường 12, Quận 10", coords: [10.7815, 106.6689], roadPath: [[10.7502, 106.6654], [10.755, 106.666], [10.765, 106.667], [10.775, 106.668], [10.7815, 106.6689]] },
    { id: 14, name: "Trạm Quận 11", address: "Lạc Long Quân, Phường 16, Quận 11", coords: [10.7742, 106.6415], roadPath: [[10.7815, 106.6689], [10.779, 106.658], [10.777, 106.649], [10.7742, 106.6415]] },
    { id: 15, name: "Trạm Tân Phú", address: "Lũy Bán Bích, Phường Tân Sơn Nhì, Quận Tân Phú", coords: [10.7912, 106.6315], roadPath: [[10.7742, 106.6415], [10.778, 106.638], [10.783, 106.635], [10.788, 106.633], [10.7912, 106.6315]] },
    { id: 16, name: "Trạm Bình Tân", address: "Kinh Dương Vương, Phường Bình Hưng Hòa, Quận Bình Tân", coords: [10.7915, 106.6012], roadPath: [[10.7912, 106.6315], [10.791, 106.626], [10.791, 106.616], [10.7915, 106.6012]] },
    { id: 17, name: "Trạm ĐH Bách Khoa", address: "Đại học Bách Khoa TP.HCM", coords: [10.7732, 106.6597], roadPath: [[10.7915, 106.6012], [10.785, 106.621], [10.779, 106.641], [10.7732, 106.6597]] },
    { id: 18, name: "Trạm ĐH Kinh tế", address: "Đại học Kinh tế TP.HCM", coords: [10.7745, 106.6798], roadPath: [[10.7732, 106.6597], [10.773, 106.664], [10.773, 106.669], [10.774, 106.674], [10.7745, 106.6798]] },
    { id: 19, name: "Trạm ĐH Y Dược", address: "Đại học Y Dược TP.HCM", coords: [10.7721, 106.6723], roadPath: [[10.7745, 106.6798], [10.773, 106.676], [10.7721, 106.6723]] },
    { id: 20, name: "Trạm ĐH Sư phạm", address: "Đại học Sư phạm TP.HCM", coords: [10.7734, 106.6676], roadPath: [[10.7721, 106.6723], [10.772, 106.670], [10.773, 106.668], [10.7734, 106.6676]] },
    { id: 21, name: "ĐH Sài Gòn - Điểm đến", address: "273 An Dương Vương, Quận 5", coords: universityLocation, roadPath: [[10.7734, 106.6676], [10.770, 106.672], [10.766, 106.677], [10.7629, 106.6825]] }
];


const allRouteCoords = busStops.reduce((acc, stop, index) => {
    if (index > 0) {
        acc.push(...busStops[index - 1].roadPath);
    }
    if (index === busStops.length - 1) {
        acc.push(...stop.roadPath);
    }
    return acc;
}, []);

const createBusIcon = () => new L.divIcon({
    className: 'bus-marker',
    html: '<i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M176 352h160v-64H176v64zm32-48h96v16h-96v-16zm176-208H32v192h16v64h32v-64h352v-64h16v-64h-16v-16c0-44.112-35.888-80-80-80H112c-44.112 0-80 35.888-80 80v16zm-16 16v32h448v-32H32zm400 64H80v96h352v-96zM112 80h288c26.468 0 48 21.532 48 48v16H64v-16c0-26.468 21.532-48 48-48zm-16 288c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32zm288 0c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32z"/></svg></i>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const createSchoolIcon = () => new L.divIcon({
    className: 'school-marker',
    html: '<i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M496 128v16c0 4.418-3.582 8-8 8h-24v12c0 6.627-5.373 12-12 12H60c-6.627 0-12-5.373-12-12v-12H24c-4.418 0-8-3.582-8-8v-16c0-4.418 3.582-8 8-8h24v-12c0-6.627 5.373-12 12-12h392c6.627 0 12 5.373 12 12v12h24c4.418 0 8 3.582 8 8zm-32 16H48v-16h416v16zm-248 32v224h32V176h-32zm-64 0v224h32V176h-32zm128 0v224h32V176h-32zM48 400h416v32H48v-32zm424-256H40c-13.255 0-24 10.745-24 24v192c0 13.255 10.745 24 24 24h432c13.255 0 24-10.745 24-24V168c0-13.255-10.745-24-24-24zM464 384H48V173.373C48 170.397 50.397 168 53.373 168h405.254C461.603 168 464 170.397 464 173.373V384z"/></svg></i>',
    iconSize: [25, 25],
    iconAnchor: [12, 12]
});

const createStopIcon = (id, isFirst = false) => new L.divIcon({
    className: 'stop-marker',
    html: isFirst ? 
        '<i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M73 392.5l246.5-164.3L73 63.8v328.7zM34 24C4.6 40-5.8 72.8 5.4 102.7l30.9 82.3L34 200v112l-0.5 14.9C30.2 355.7 4.6 388 34 404.1c25 13.5 56.2 12.8 79.1-2.9l255.4-170.3C388.2 220 384.4 199.1 368.5 192l-51.5-24.1L347.1 85c-11.8-31.4-44.1-47.3-75.5-35.4L34 24z"/></svg></i>' : 
        `<span>${id}</span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// --- Component Sidebar ---
const Sidebar = ({ activeView, setActiveView }) => {
    const menuItems = [
        { id: 'dashboard', name: 'Bảng điều khiển', icon: <FaTachometerAlt /> },
        { id: 'buses', name: 'Quản lý xe buýt', icon: <FaBus /> },
        { id: 'students', name: 'Quản lý học sinh', icon: <FaUserGraduate /> },
        { id: 'drivers', name: 'Quản lý tài xế', icon: <FaIdCard /> },
        { id: 'scheduling', name: 'Lập lịch trình', icon: <FaCalendarAlt /> },
        { id: 'routes', name: 'Quản lý tuyến', icon: <FaRoute /> },
    ];

    return (
        <nav className="admin-sidebar">
            <div className="sidebar-header">
                <h3><FaBus /> SGU Bus Admin</h3>
            </div>
            <ul className="sidebar-menu">
                {menuItems.map(item => (
                    <li key={item.id}>
                        <a
                            href="#"
                            className={activeView === item.id ? 'active' : ''}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveView(item.id);
                            }}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

// --- Component MapView (Bảng điều khiển) ---
const DashboardView = () => {
    const [isRouteActive, setIsRouteActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [busPosition, setBusPosition] = useState(busStops[0].coords);
    const [busStats, setBusStats] = useState({
        status: 'Đang chờ',
        statusClass: 'status-stopped',
        speed: '--',
        timeRemaining: '--',
        distanceRemaining: '--',
        currentStop: '--',
    });
    const [activeStopId, setActiveStopId] = useState(-1);
    
    const busIntervalRef = useRef(null);
    const mapRef = useRef(null);

    // Dọn dẹp interval khi component unmount
    useEffect(() => {
        return () => {
            if (busIntervalRef.current) {
                clearInterval(busIntervalRef.current);
            }
        };
    }, []);

    const updateBusInfo = (step, route) => {
        const totalTime = 112;
        const progress = step / route.length;
        const remainingTime = Math.round(totalTime * (1 - progress));
        const totalDistance = 25; 
        const remainingDistance = (totalDistance * (1 - progress)).toFixed(1);

        setBusStats(prev => ({
            ...prev,
            speed: `${25 + Math.floor(Math.random() * 20)}`,
            timeRemaining: `${remainingTime}`,
            distanceRemaining: `${remainingDistance}`,
        }));
    };

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

    const moveBus = (route) => {
        setCurrentStep(prevStep => {
            const nextStep = prevStep + 1;
            if (nextStep < route.length) {
                const newPosition = route[nextStep];
                setBusPosition(newPosition);

                if (nextStep % 200 === 0) { 
                    updateBusInfo(nextStep, route);
                    
                    const nearestStop = findNearestStop(newPosition);
                    if (nearestStop && nearestStop.id !== activeStopId) {
                        setBusStats(prev => ({ ...prev, currentStop: nearestStop.name }));
                        setActiveStopId(nearestStop.id);
                    }
                }
                return nextStep;
            } else {
                finishRoute();
                return prevStep;
            }
        });
    };
    
    const startRoute = () => {
        if (isRouteActive) return;

        setIsRouteActive(true);
        setCurrentStep(0);
        setBusPosition(allRouteCoords[0]);
        setBusStats({
            status: 'Đang di chuyển',
            statusClass: 'status-moving',
            speed: '30',
            timeRemaining: '112',
            distanceRemaining: '25.0',
            currentStop: busStops[0].name,
        });
        setActiveStopId(busStops[0].id);

        if (busIntervalRef.current) {
            clearInterval(busIntervalRef.current);
        }

        busIntervalRef.current = setInterval(() => {
            moveBus(allRouteCoords);
        }, 170); 
    };

    const finishRoute = () => {
        if (busIntervalRef.current) {
            clearInterval(busIntervalRef.current);
        }
        setIsRouteActive(false);
        setBusStats({
            status: 'Đã đến nơi',
            statusClass: 'status-at-school',
            speed: '0',
            timeRemaining: '0',
            distanceRemaining: '0',
            currentStop: busStops[busStops.length - 1].name,
        });
        setActiveStopId(busStops[busStops.length - 1].id);
    };
    
    const resetRoute = () => {
        if (busIntervalRef.current) {
            clearInterval(busIntervalRef.current);
        }
        setIsRouteActive(false);
        setCurrentStep(0);
        setBusPosition(busStops[0].coords);
        setBusStats({
            status: 'Đang chờ',
            statusClass: 'status-stopped',
            speed: '--',
            timeRemaining: '--',
            distanceRemaining: '--',
            currentStop: '--',
        });
        setActiveStopId(-1);
    };

    const locateBus = () => {
        if (mapRef.current && isRouteActive) {
            mapRef.current.flyTo(busPosition, 16);
        }
    };

    return (
        <div className="admin-page-content dashboard-layout">
            <div className="map-container-admin">
                <div className="map-controls-admin">
                    <button onClick={startRoute} className="btn-success">
                        <FaPlay /> Bắt đầu tuyến
                    </button>
                    <button onClick={locateBus}><FaMapMarkerAlt /> Định vị xe</button>
                    <button onClick={resetRoute} className="btn-warning">
                        <FaRedo /> Đặt lại
                    </button>
                </div>
                <MapContainer 
                    center={universityLocation} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                    whenCreated={mapInstance => { mapRef.current = mapInstance; }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    
                    {/* Vẽ tuyến đường */}
                    <Polyline positions={allRouteCoords} color="#1e5799" weight={6} opacity={0.7} />
                    
                    {/* Vẽ các trạm */}
                    {busStops.map((stop, index) => (
                        <Marker 
                            key={stop.id} 
                            position={stop.coords} 
                            icon={createStopIcon(stop.id, index === 0)}
                        >
                            <Popup>
                                <b>Trạm {stop.id}: {stop.name}</b><br />{stop.address}
                            </Popup>
                        </Marker>
                    ))}

                    {/* Vẽ trường */}
                    <Marker position={universityLocation} icon={createSchoolIcon()}>
                        <Popup><b>Đại học Sài Gòn (Điểm đến)</b><br />273 An Dương Vương, Q.5</Popup>
                    </Marker>
                    
                    {/* Vẽ xe buýt */}
                    {isRouteActive && (
                        <Marker position={busPosition} icon={createBusIcon()}>
                            <Popup><b>Xe buýt 51B-12345</b><br />Đang di chuyển</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
            
            <div className="info-panel-admin">
                <div className="admin-card">
                    <h2><FaBus /> Thông tin xe buýt</h2>
                    <div className="bus-info">
                        <div className="info-item">
                            <span className="info-label">Biển số xe:</span>
                            <span className="info-value">51B-12345</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Trạng thái:</span>
                            <span className="info-value">
                                <span className={`status-indicator ${busStats.statusClass}`}></span>
                                {busStats.status}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Tốc độ:</span>
                            <span className="info-value">{busStats.speed} km/h</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Thời gian còn lại:</span>
                            <span className="info-value">{busStats.timeRemaining} phút</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Khoảng cách:</span>
                            <span className="info-value">{busStats.distanceRemaining} km</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Trạm hiện tại:</span>
                            <span className="info-value">{busStats.currentStop}</span>
                        </div>
                    </div>
                </div>

                <div className="admin-card">
                    <h2><FaRoute /> Danh sách trạm (21)</h2>
                    <div className="stops-list-admin">
                        {busStops.map((stop) => (
                            <div 
                                key={stop.id} 
                                className={`stop-item-admin ${stop.id === activeStopId ? 'active' : ''}`}
                                onClick={() => mapRef.current.flyTo(stop.coords, 15)}
                            >
                                <div className="stop-number">{stop.id}</div>
                                <div className="stop-info">
                                    <div className="stop-name">{stop.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Component Quản lý Xe buýt ---
const BusManagement = () => (
    <div className="admin-page-content">
        <div className="admin-page-header">
            <h2><FaBus /> Quản lý xe buýt</h2>
            <button className="btn-success">Thêm xe buýt mới</button>
        </div>
        <div className="admin-card">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Biển số xe</th>
                        <th>Tuyến đang chạy</th>
                        <th>Tài xế</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>51B-12345</td>
                        <td>Quận 12 → ĐH Sài Gòn</td>
                        <td>Trần Văn C</td>
                        <td><span className="status-badge status-moving">Đang di chuyển</span></td>
                        <td><button className="btn-warning btn-sm">Sửa</button> <button className="btn-danger btn-sm">Xóa</button></td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>51B-67890</td>
                        <td>Củ Chi → ĐH Sài Gòn</td>
                        <td>Nguyễn Văn D</td>
                        <td><span className="status-badge status-stopped">Đang chờ</span></td>
                        <td><button className="btn-warning btn-sm">Sửa</button> <button className="btn-danger btn-sm">Xóa</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

// --- Component Quản lý Học sinh ---
const StudentManagement = () => (
    <div className="admin-page-content">
        <div className="admin-page-header">
            <h2><FaUserGraduate /> Quản lý học sinh</h2>
            <button className="btn-success">Thêm học sinh mới</button>
        </div>
        <div className="admin-card">
            <input type="text" placeholder="Tìm kiếm học sinh (tên, lớp, ID)..." className="search-bar" />
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID Học sinh</th>
                        <th>Tên học sinh</th>
                        <th>Lớp</th>
                        <th>Phụ huynh</th>
                        <th>Tuyến xe</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>HS1023</td>
                        <td>Nguyễn Thị B</td>
                        <td>3A</td>
                        <td>Nguyễn Văn A</td>
                        <td>Quận 12 → ĐH Sài Gòn</td>
                        <td><span className="status-badge status-on-bus">Đang trên xe</span></td>
                        <td><button className="btn-warning btn-sm">Sửa</button> <button className="btn-danger btn-sm">Xóa</button></td>
                    </tr>
                    <tr>
                        <td>HS1024</td>
                        <td>Lê Văn E</td>
                        <td>3A</td>
                        <td>Lê Thị F</td>
                        <td>Quận 12 → ĐH Sài Gòn</td>
                        <td><span className="status-badge status-on-bus">Đang trên xe</span></td>
                        <td><button className="btn-warning btn-sm">Sửa</button> <button className="btn-danger btn-sm">Xóa</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

// --- Component Quản lý Tài xế ---
const DriverManagement = () => (
    <div className="admin-page-content">
        <div className="admin-page-header">
            <h2><FaIdCard /> Quản lý tài xế</h2>
            <button className="btn-success">Thêm tài xế mới</button>
        </div>
        <div className="admin-card">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID Tài xế</th>
                        <th>Tên tài xế</th>
                        <th>Bằng lái</th>
                        <th>Xe đang lái</th>
                        <th>Số điện thoại</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>TX001</td>
                        <td>Trần Văn C</td>
                        <td>B2, D</td>
                        <td>51B-12345</td>
                        <td>090xxxx123</td>
                        <td><button className="btn-warning btn-sm">Sửa</button> <button className="btn-danger btn-sm">Xóa</button></td>
                    </tr>
                    <tr>
                        <td>TX002</td>
                        <td>Nguyễn Văn D</td>
                        <td>B2, D</td>
                        <td>51B-67890</td>
                        <td>091xxxx456</td>
                        <td><button className="btn-warning btn-sm">Sửa</button> <button className="btn-danger btn-sm">Xóa</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

// --- Component Lập lịch trình & Phân công ---
const Scheduling = () => (
    <div className="admin-page-content">
        <div className="admin-page-header">
            <h2><FaCalendarAlt /> Lập lịch trình & Phân công</h2>
        </div>
        <div className="admin-card">
            <h3>Phân công cho ngày mai (20/10/2025)</h3>
            <form className="schedule-form">
                <div className="form-group">
                    <label htmlFor="route">Chọn tuyến đường:</label>
                    <select id="route">
                        <option>Tuyến: Quận 12 → ĐH Sài Gòn (21 trạm)</option>
                        <option>Tuyến: Củ Chi → ĐH Sài Gòn (25 trạm)</option>
                        <option>Tuyến: Bình Chánh → ĐH Sài Gòn (18 trạm)</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="driver">Chọn tài xế:</label>
                    <select id="driver">
                        <option>Trần Văn C (TX001)</option>
                        <option>Nguyễn Văn D (TX002)</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="bus">Chọn xe buýt:</label>
                    <select id="bus">
                        <option>51B-12345 (45 chỗ)</option>
                        <option>51B-67890 (29 chỗ)</option>
                    </select>
                </div>
                <button type="submit" className="btn-success">Xác nhận phân công</button>
            </form>
        </div>
    </div>
);

// --- Component Quản lý Tuyến ---
const RouteManagement = () => (
    <div className="admin-page-content">
        <div className="admin-page-header">
            <h2><FaRoute /> Quản lý tuyến đường</h2>
            <button className="btn-success">Tạo tuyến mới</button>
        </div>
        <div className="admin-card">
            <p>Chức năng này cho phép Admin thêm, xóa, sửa các trạm dừng và thứ tự của các tuyến đường.</p>
            {/* Giao diện kéo thả hoặc bản đồ chỉnh sửa có thể được thêm vào đây */}
        </div>
    </div>
);

// --- Component AdminPage (Trang chính) ---
const AdminPage = () => {
    const [activeView, setActiveView] = useState('dashboard');

    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardView />;
            case 'buses':
                return <BusManagement />;
            case 'students':
                return <StudentManagement />;
            case 'drivers':
                return <DriverManagement />;
            case 'scheduling':
                return <Scheduling />;
            case 'routes':
                return <RouteManagement />;
            default:
                return <DashboardView />;
        }
    };

    return (
        <div className="admin-layout">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="admin-content">
                {renderView()}
            </main>
        </div>
    );
};

export default AdminPage;