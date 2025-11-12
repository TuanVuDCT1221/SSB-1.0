// src/controllers/stopsController.js
const db = require('../db'); // kết nối MySQL

// Lấy toàn bộ trạm
exports.getAllStops = async (req, res) => {
  try {
    const [stops] = await db.query('SELECT * FROM Stops');
    res.json(stops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách trạm.' });
  }
};

// Thêm trạm mới
exports.createStop = async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;
    await db.query(
      'INSERT INTO Stops (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );
    res.json({ message: 'Thêm trạm thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi thêm trạm.' });
  }
};

// Cập nhật trạm
exports.updateStop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, latitude, longitude } = req.body;
    await db.query(
      'UPDATE Stops SET name=?, address=?, latitude=?, longitude=? WHERE stop_id=?',
      [name, address, latitude, longitude, id]
    );
    res.json({ message: 'Cập nhật trạm thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi cập nhật trạm.' });
  }
};

// Xóa trạm
exports.deleteStop = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Stops WHERE stop_id=?', [id]);
    res.json({ message: 'Xóa trạm thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi xóa trạm.' });
  }
};
