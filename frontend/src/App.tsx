// App.tsx

import React from "react";
import { Routes, Route } from "react-router-dom";
// Đảm bảo tên file import khớp với tên file mới (ví dụ: LoginPage.jsx)
import LoginPage from "./pages/LoginPage/LoginPage"; 
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import ParentPage from "./pages/ParentPage";
import DriverPage from "./pages/DriverPage/DriverPage"; // Nếu bạn đặt tên folder là DriverPage


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/parent" element={<ParentPage />} />
      <Route path="/driver" element={<DriverPage/>} />
    </Routes>
  );
}