const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 8000;
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

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

// Validation function
function validateCourse(data) {
    const errors = [];

    if (!data.CourseCode || data.CourseCode.trim() === '') {
        errors.push({ msg: 'Course Code is required', param: 'CourseCode' });
    }

    if (!data.CourseName || data.CourseName.trim() === '') {
        errors.push({ msg: 'Course Name is required', param: 'CourseName' });
    } else if (!/^[A-Za-z\s]+$/.test(data.CourseName)) {
        errors.push({ msg: 'Course Name must contain only letters and spaces', param: 'CourseName' });
    }

    if (!data.Syllabus || data.Syllabus.trim() === '') {
        errors.push({ msg: 'Syllabus is required', param: 'Syllabus' });
    } else {
        try {
            new URL(data.Syllabus);
        } catch (_) {
            errors.push({ msg: 'Syllabus must be a valid URL', param: 'Syllabus' });
        }
    }

    if (!data.Progression || data.Progression.trim() === '') {
        errors.push({ msg: 'Progression is required', param: 'Progression' });
    } else if (!['A', 'B', 'C', 'D', 'E'].includes(data.Progression)) {
        errors.push({ msg: 'Progression must be A, B, C, D, or E', param: 'Progression' });
    }

    return errors;
}

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

app.get('/add', (req, res) => {
    res.render('add', { errors: [], data: {} });
});

app.post('/add', (req, res) => {
    const errors = validateCourse(req.body);

    if (errors.length > 0) {
        console.log('Validation errors:', errors);
        return res.render('add', {
            errors: errors,
            data: req.body
        });
    }

    const { CourseCode, CourseName, Syllabus, Progression } = req.body;
    console.log('Form data:', req.body);

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

app.get('/about', (req, res) => {
    res.render('about');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
