const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET: Mengambil semua data pengaduan
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                reports.*,
                users.name AS user_name,
                categories.name AS category_name
            FROM reports
            LEFT JOIN users
                ON reports.user_id = users.id
            LEFT JOIN categories
                ON reports.category_id = categories.id
            ORDER BY reports.created_at DESC
        `);

        res.status(200).json({
            message: 'Berhasil mengambil data pengaduan',
            data: result.rows
        });

    } catch (error) {
        res.status(500).json({
            message: 'Gagal mengambil data pengaduan',
            error: error.message
        });
    }
});

// GET pencarian pengaduan berdasarkan nama pelapor
router.get('/search', async (req, res) => {
    try {
        const { reporter_name } = req.query;

        if (!reporter_name) {
            return res.status(400).json({
                message: 'Parameter reporter_name wajib diisi'
            });
        }

        const result = await pool.query(
            `SELECT *
             FROM reports
             WHERE reporter_name ILIKE $1
             ORDER BY created_at DESC`,
            [`%${reporter_name}%`]
        );

        res.status(200).json({
            message: 'Berhasil mencari data pengaduan',
            data: result.rows
        });

    } catch (error) {
        res.status(500).json({
            message: 'Gagal mencari data pengaduan',
            error: error.message
        });
    }
});

// GET: Mengambil satu data berdasarkan ID
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM reports WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Data pengaduan tidak ditemukan'
            });
        }

        res.json({
            message: 'Data pengaduan berhasil ditemukan',
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Menambahkan data pengaduan
router.post('/', async (req, res) => {
    try {
        const {
            ticket_code,
            reporter_name,
            reporter_phone,
            is_anonymous,
            category_id,
            dusun,
            location_details,
            description,
            attachment_photo
        } = req.body;

        if (!ticket_code || !category_id || !description) {
            return res.status(400).json({
                message: 'ticket_code, category_id, dan description wajib diisi'
            });
        }

        // Cek kategori berdasarkan ID
        const categoryResult = await pool.query(
            'SELECT name FROM categories WHERE id = $1',
            [category_id]
        );

        if (categoryResult.rows.length === 0) {
            return res.status(404).json({
                message: 'Kategori tidak ditemukan'
            });
        }

        const category = categoryResult.rows[0].name;

        // Simpan pengaduan
        const result = await pool.query(
            `INSERT INTO reports (
                ticket_code, reporter_name, reporter_phone,
                is_anonymous, category, category_id, user_id,
                dusun, location_details, description, attachment_photo
            )
            VALUES ($1, $2, $3, $4, $5, $6, NULL, $7, $8, $9, $10)
            RETURNING *`,
            [
                ticket_code,
                reporter_name,
                reporter_phone,
                is_anonymous ?? false,
                category,
                category_id,
                dusun,
                location_details,
                description,
                attachment_photo
            ]
        );

        res.status(201).json({
            message: 'Pengaduan berhasil ditambahkan',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// PUT: Mengubah data pengaduan berdasarkan ID
router.put('/:id', async (req, res) => {
    try {
        const {
            reporter_name,
            reporter_phone,
            is_anonymous,
            category_id,
            dusun,
            location_details,
            description,
            attachment_photo,
            status,
            admin_feedback
        } = req.body;

        // Cek apakah kategori tersedia
        const categoryResult = await pool.query(
            'SELECT name FROM categories WHERE id = $1',
            [category_id]
        );

        if (categoryResult.rows.length === 0) {
            return res.status(404).json({
                message: 'Kategori tidak ditemukan'
            });
        }

        const category = categoryResult.rows[0].name;

        const result = await pool.query(
            `UPDATE reports SET
                reporter_name = $1,
                reporter_phone = $2,
                is_anonymous = $3,
                category = $4,
                category_id = $5,
                dusun = $6,
                location_details = $7,
                description = $8,
                attachment_photo = $9,
                status = $10,
                admin_feedback = $11,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $12
            RETURNING *`,
            [
                reporter_name,
                reporter_phone,
                is_anonymous ?? false,
                category,
                category_id,
                dusun,
                location_details,
                description,
                attachment_photo,
                status,
                admin_feedback,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Data pengaduan tidak ditemukan'
            });
        }

        res.json({
            message: 'Pengaduan berhasil diperbarui',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// DELETE: Menghapus data pengaduan berdasarkan ID
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM reports WHERE id = $1 RETURNING *',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Data pengaduan tidak ditemukan'
            });
        }

        res.json({
            message: 'Pengaduan berhasil dihapus',
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;