import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function LoginPage() {
  return (
    <div className="auth-container">
      <h1 className="title">Đăng nhập</h1>

      <form className="auth-form">
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Mật khẩu" required />
        <button className="btn-primary">Đăng nhập</button>
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
