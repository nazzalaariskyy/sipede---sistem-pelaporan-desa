
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./src/config/database');

const reportRoutes = require('./src/routes/reportRoutes');

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'API SiPede berhasil berjalan!'
    });
});

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');

        res.json({
            message: 'Koneksi PostgreSQL berhasil!',
            time: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            message: 'Koneksi database gagal',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
