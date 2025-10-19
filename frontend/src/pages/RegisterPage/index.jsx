import React from "react";
import { Link } from "react-router-dom";
import "./Register.css";

export default function RegisterPage() {
  return (
    <div className="auth-container">
      <h1 className="title">Đăng ký</h1>

      <form className="auth-form">
        <input type="text" placeholder="Tên người dùng" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Mật khẩu" required />
        <button className="btn-primary">Tạo tài khoản</button>
      </form>

      <p className="switch-text">
        Đã có tài khoản?{" "}
        <Link to="/" className="link">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
