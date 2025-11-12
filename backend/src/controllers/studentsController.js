// src/controllers/studentsController.js
const db = require('../db');

exports.getAllStudents = async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT s.student_id, s.full_name, s.class_name, s.parent_user_id,s.route_id, s.pickup_stop_id, st.name AS stop_name
      FROM Students s
      LEFT JOIN Stops st ON s.pickup_stop_id = st.stop_id
    `);
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách học sinh' });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, grade, parent_contact, stop_id } = req.body;
    await db.query(
      'INSERT INTO Students (name, grade, parent_contact, stop_id) VALUES (?, ?, ?, ?)',
      [name, grade, parent_contact, stop_id]
    );
    res.json({ message: 'Thêm học sinh thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi thêm học sinh' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade, parent_contact, stop_id } = req.body;
    await db.query(
      'UPDATE Students SET name=?, grade=?, parent_contact=?, stop_id=? WHERE student_id=?',
      [name, grade, parent_contact, stop_id, id]
    );
    res.json({ message: 'Cập nhật học sinh thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật học sinh' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Students WHERE student_id=?', [id]);
    res.json({ message: 'Xóa học sinh thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi xóa học sinh' });
  }
};
