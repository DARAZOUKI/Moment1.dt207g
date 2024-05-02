const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 8000;
app.set('view engine', 'ejs');
app.use(express.static('public'));

// SQLite database connection
const dbPath = 'dt207g1.db';
console.log('Database file path:', dbPath);
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err);
        return;
    }
    console.log('Connected to SQLite database');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
    db.all('SELECT * FROM courses', (err, rows) => {
        if (err) {
            console.error('Error fetching courses:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('courses', { courses: rows });
        }
    });
});

app.post('/', (req, res) => {
    const { CourseCode, CourseName, Syllabus, Progression } = req.body;
    db.run('INSERT INTO courses (coursecode, coursename, syllabus, progression) VALUES (?, ?, ?, ?)',
        [CourseCode, CourseName, Syllabus, Progression],
        (err) => {
            if (err) {
                console.error('Error inserting course:', err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/');
            }
        });
});

app.get('/delete/:id', (req, res) => {
    const courseId = req.params.id;
    db.run('DELETE FROM courses WHERE id = ?', [courseId], (err) => {
        if (err) {
            console.error('Error deleting course:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', (req, res) => {
    const { CourseCode, CourseName, Syllabus, Progression } = req.body;
    db.run('INSERT INTO courses (coursecode, coursename, syllabus, progression) VALUES (?, ?, ?, ?)',
        [CourseCode, CourseName, Syllabus, Progression],
        (err) => {
            if (err) {
                console.error('Error adding course:', err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/');
            }
        });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
