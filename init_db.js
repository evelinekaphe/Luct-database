// init_db.js - Database initialization
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'luct_database'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database!');

    // Create users table
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('student', 'lecturer', 'prl', 'pl') NOT NULL,
            faculty_name VARCHAR(255),
            name VARCHAR(100),
            email VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Create courses table
    const createCoursesTable = `
        CREATE TABLE IF NOT EXISTS courses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Create modules table
    const createModulesTable = `
        CREATE TABLE IF NOT EXISTS modules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
        )
    `;

    // Create course_lecturers table
    const createCourseLecturersTable = `
        CREATE TABLE IF NOT EXISTS course_lecturers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            lecturer_id INT NOT NULL,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    // Create reports table
    const createReportsTable = `
        CREATE TABLE IF NOT EXISTS reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            faculty_name VARCHAR(255),
            class_name VARCHAR(255),
            week_of_reporting VARCHAR(50),
            date_of_lecture DATE,
            course_name VARCHAR(255),
            course_code VARCHAR(255),
            lecturer_name VARCHAR(255),
            actual_students INT,
            total_registered_students INT,
            venue VARCHAR(255),
            scheduled_time TIME,
            topic_taught TEXT,
            learning_outcomes TEXT,
            recommendations TEXT,
            lecturer_id INT,
            feedback TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (lecturer_id) REFERENCES users(id)
        )
    `;

    // Create ratings table
    const createRatingsTable = `
        CREATE TABLE IF NOT EXISTS ratings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            report_id INT,
            rating INT CHECK (rating >= 1 AND rating <= 5),
            user_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (report_id) REFERENCES reports(id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE KEY unique_rating (report_id, user_id)
        )
    `;

    // Create monitoring table
    const createMonitoringTable = `
        CREATE TABLE IF NOT EXISTS monitoring (
            id INT AUTO_INCREMENT PRIMARY KEY,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Create classes table
    const createClassesTable = `
        CREATE TABLE IF NOT EXISTS classes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Create lectures table
    const createLecturesTable = `
        CREATE TABLE IF NOT EXISTS lectures (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            scheduled_at DATETIME,
            class_id INT,
            course_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (class_id) REFERENCES classes(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )
    `;

    // Sequentially create tables
    connection.query(createUsersTable, (err) => {
        if (err) throw err;
        console.log('Users table created/verified');

        connection.query(createCoursesTable, (err) => {
            if (err) throw err;
            console.log('Courses table created/verified');

            connection.query(createModulesTable, (err) => {
                if (err) throw err;
                console.log('Modules table created/verified');

                connection.query(createCourseLecturersTable, (err) => {
                    if (err) throw err;
                    console.log('Course Lecturers table created/verified');

                    connection.query(createReportsTable, (err) => {
                        if (err) throw err;
                        console.log('Reports table created/verified');

                        connection.query(createRatingsTable, (err) => {
                            if (err) throw err;
                            console.log('Ratings table created/verified');

                            connection.query(createMonitoringTable, (err) => {
                                if (err) throw err;
                                console.log('Monitoring table created/verified');

                                connection.query(createClassesTable, (err) => {
                                    if (err) throw err;
                                    console.log('Classes table created/verified');

                                    connection.query(createLecturesTable, (err) => {
                                        if (err) throw err;
                                        console.log('Lectures table created/verified');

                                        console.log('All tables are set up!');
                                        connection.end();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});