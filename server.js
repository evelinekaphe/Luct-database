// server.js - fully updated backend
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db'); // MySQL connection module
const ExcelJS = require('exceljs');

const app = express();

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

const SECRET = 'your-secret-key';

// -------------------- Helpers --------------------
const sendDbError = (res, err, status = 500) => {
  console.error('DB Error:', err);
  const msg = (err && (err.sqlMessage || err.message)) ? (err.sqlMessage || err.message) : 'Database error';
  return res.status(status).json({ error: msg });
};

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Access denied' });
  next();
};

// -------------------- AUTH --------------------
app.post('/api/auth/register', (req, res) => {
  const { username, password, role, faculty_name } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: 'Missing required fields' });
  const hashedPw = bcrypt.hashSync(password, 10);
  const sql = 'INSERT INTO users (username, password, role, faculty_name) VALUES (?, ?, ?, ?)';
  db.query(sql, [username, hashedPw, role, faculty_name], (err) => {
    if (err) return sendDbError(res, err);
    res.json({ message: 'User registered successfully!' });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) return sendDbError(res, err);
    if (!results || results.length === 0) return res.status(400).json({ error: 'User not found' });
    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Wrong password' });
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role, userId: user.id });
  });
});

// -------------------- REPORTS --------------------
const insertReport = (req, res) => {
  const {
    faculty_name, class_name, week_of_reporting, date_of_lecture,
    course_name, course_code, lecturer_name,
    actual_students, total_registered_students,
    venue, scheduled_time, topic_taught,
    learning_outcomes, recommendations
  } = req.body;

  if (!faculty_name || !class_name || !week_of_reporting || !date_of_lecture || !course_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const actualNum = parseInt(actual_students || 0, 10);
  const totalNum = parseInt(total_registered_students || 0, 10);

  if (Number.isNaN(actualNum) || Number.isNaN(totalNum)) {
    return res.status(400).json({ error: 'actual_students and total_registered_students must be numbers' });
  }

  const sql = `INSERT INTO reports
    (faculty_name, class_name, week_of_reporting, date_of_lecture, course_name, course_code,
     lecturer_name, actual_students, total_registered_students, venue, scheduled_time,
     topic_taught, learning_outcomes, recommendations, lecturer_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    faculty_name, class_name, week_of_reporting, date_of_lecture, course_name,
    course_code || null, lecturer_name || null,
    actualNum, totalNum, venue || null, scheduled_time || null,
    topic_taught || null, learning_outcomes || null, recommendations || null,
    req.user.id
  ];

  db.query(sql, values, (err, result) => {
    if (err) return sendDbError(res, err);
    res.json({ message: 'Report submitted successfully!', reportId: result.insertId });
  });
};

app.post('/api/reports', verifyToken, checkRole(['lecturer']), insertReport);
app.post('/api/reports/submit', verifyToken, checkRole(['lecturer']), insertReport);

app.get('/api/reports/view', verifyToken, (req, res) => {
  const sql = `
    SELECT r.*, rat.rating
    FROM reports r
    LEFT JOIN ratings rat ON r.id = rat.report_id
    ORDER BY r.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

app.get('/api/reports/search', verifyToken, (req, res) => {
  const { query } = req.query;
  const sql = `
    SELECT r.*, rat.rating
    FROM reports r
    LEFT JOIN ratings rat ON r.id = rat.report_id
    WHERE r.course_name LIKE ? OR r.week_of_reporting LIKE ?
    ORDER BY r.created_at DESC
  `;
  db.query(sql, [`%${query}%`, `%${query}%`], (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

app.put('/api/reports/feedback/:id', verifyToken, checkRole(['prl']), (req, res) => {
  const { feedback } = req.body;
  db.query('UPDATE reports SET feedback = ? WHERE id = ?', [feedback, req.params.id], (err) => {
    if (err) return sendDbError(res, err);
    res.json({ message: 'Feedback added successfully!' });
  });
});

// -------------------- MONITORING --------------------
app.get('/api/monitoring', verifyToken, (req, res) => {
  const { role, id: userId } = req.user;

  let sql = '';
  let params = [];

  if (role === 'student') {
    // Students see only attendance & courses (no filtering by non-existing student_id)
    sql = `
      SELECT course_name, week_of_reporting, actual_students, total_registered_students
      FROM reports
      ORDER BY week_of_reporting DESC
    `;
  } else if (role === 'lecturer') {
    sql = `
      SELECT course_name, week_of_reporting, actual_students, total_registered_students, feedback
      FROM reports
      WHERE lecturer_id = ?
      ORDER BY week_of_reporting DESC
    `;
    params = [userId];
  } else if (role === 'prl' || role === 'pl') {
    sql = `
      SELECT course_name, week_of_reporting, actual_students, total_registered_students,
             lecturer_name, feedback, rat.rating
      FROM reports r
      LEFT JOIN ratings rat ON r.id = rat.report_id
      ORDER BY week_of_reporting DESC
    `;
  } else {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.query(sql, params, (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});


// -------------------- COURSES --------------------
app.get('/api/courses', verifyToken, (req, res) => {
  db.query('SELECT * FROM courses', (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

app.post('/api/courses', verifyToken, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing course name' });
  db.query('INSERT INTO courses (name) VALUES (?)', [name], (err) => {
    if (err) return sendDbError(res, err);
    res.json({ message: 'Course added successfully!' });
  });
});

app.put('/api/courses/:id/assign', verifyToken, (req, res) => {
  const { lecturerId } = req.body;
  if (!lecturerId) return res.status(400).json({ error: 'Missing lecturerId' });
  db.query('UPDATE courses SET lecturer_id = ? WHERE id = ?', [lecturerId, req.params.id], (err) => {
    if (err) return sendDbError(res, err);
    res.json({ message: 'Lecturer assigned to course' });
  });
});

// -------------------- CLASSES --------------------
app.get('/api/classes', verifyToken, (req, res) => {
  db.query('SELECT * FROM classes', (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

app.post('/api/classes', verifyToken, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing class name' });
  db.query('INSERT INTO classes (name) VALUES (?)', [name], (err) => {
    if (err) return sendDbError(res, err);
    res.json({ message: 'Class added successfully!' });
  });
});

// -------------------- LECTURES --------------------
app.get('/api/lectures', verifyToken, (req, res) => {
  db.query('SELECT * FROM lectures', (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

app.post('/api/lectures', verifyToken, (req, res) => {
  const { title, description, scheduled_at, class_id, course_id } = req.body;
  if (!title) return res.status(400).json({ error: 'Missing title' });
  db.query(
    'INSERT INTO lectures (title, description, scheduled_at, class_id, course_id) VALUES (?, ?, ?, ?, ?)',
    [title, description || null, scheduled_at || null, class_id || null, course_id || null],
    (err) => {
      if (err) return sendDbError(res, err);
      res.json({ message: 'Lecture added successfully!' });
    }
  );
});

// -------------------- MODULES --------------------
app.get('/api/modules', verifyToken, (req, res) => {
  db.query('SELECT * FROM modules', (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

app.post('/api/modules', verifyToken, (req, res) => {
  const { course_id, name, description } = req.body;
  if (!course_id || !name) return res.status(400).json({ error: 'Missing course_id or name' });
  db.query('INSERT INTO modules (course_id, name, description) VALUES (?, ?, ?)', [course_id, name, description || null], (err) => {
    if (err) return sendDbError(res, err);
    res.json({ message: 'Module added successfully!' });
  });
});

// -------------------- RATINGS --------------------
app.post('/api/rate', verifyToken, checkRole(['student', 'prl', 'pl']), (req, res) => {
  const { report_id, rating } = req.body;
  if (!report_id || !rating) return res.status(400).json({ error: 'report_id and rating required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1–5' });

  const sql = `
    INSERT INTO ratings (report_id, rating, user_id)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE rating = VALUES(rating)
  `;
  db.query(sql, [report_id, rating, req.user.id], (err) => {
    if (err) return sendDbError(res, err);
    res.json({ message: 'Rating saved successfully!' });
  });
});

// -------------------- REPORT DOWNLOAD --------------------
app.get('/api/reports/download/:id', verifyToken, async (req, res) => {
  const reportId = req.params.id;
  db.query('SELECT * FROM reports WHERE id = ?', [reportId], async (err, results) => {
    if (err) return sendDbError(res, err);
    if (!results.length) return res.status(404).json({ error: 'Report not found' });

    const report = results[0];
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Report');
      sheet.columns = [
        { header: 'Field', key: 'field', width: 25 },
        { header: 'Value', key: 'value', width: 50 }
      ];
      Object.entries(report).forEach(([k, v]) => sheet.addRow({ field: k, value: v ?? '' }));

      res.setHeader('Content-Disposition', `attachment; filename=report_${reportId}.xlsx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      await workbook.xlsx.write(res);
      res.end();
    } catch (e) {
      console.error('Excel error:', e);
      res.status(500).json({ error: 'Failed to generate Excel' });
    }
  });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
