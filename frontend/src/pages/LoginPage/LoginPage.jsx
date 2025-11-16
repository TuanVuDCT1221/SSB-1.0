// src/pages/LoginPage/LoginPage.jsx (Code đã sửa lỗi ReferenceError)

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

// --- CẤU HÌNH API ---
const API_URL = 'http://localhost:4000/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Dòng code này sẽ định nghĩa biến 'res'
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });

      // TẤT CẢ LỆNH TRUY CẬP 'res' PHẢI NẰM TRONG KHỐI NÀY
      const token = res.data.token;
      const role = res.data.Role;
      const fullName = res.data.FullName;

      // 1. Lưu Token và Tên vào Local Storage
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('driver_full_name', fullName);

      // 2. Chuyển hướng dựa trên Role
      switch (role.toUpperCase()) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'DRIVER':
          navigate('/driver');
          break;
        case 'PARENT':
          navigate('/parent');
          break;
        default:
          setError('Vai trò người dùng không hợp lệ.');
      }

    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      // Hiển thị thông báo lỗi
      setError(err.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className="auth-container">
      <h1 className="title">Đăng nhập SSB 1.0</h1>

      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Tên đăng nhập (Username)"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu (123456)"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

        <button type="submit" className="btn-primary">Đăng nhập</button>
      </form>

      <p className="switch-text">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="link">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}