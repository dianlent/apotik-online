-- =====================================================
-- Script untuk Seed Kategori Apotik
-- Menghapus kategori lama dan menambahkan kategori baru
-- =====================================================

-- Hapus semua kategori yang ada (hati-hati: ini akan menghapus semua kategori)
-- Pastikan tidak ada produk yang terhubung, atau set foreign key ke NULL terlebih dahulu
DELETE FROM categories;

-- Reset auto-increment counter (opsional, tergantung database)
-- Untuk PostgreSQL (Supabase menggunakan PostgreSQL):
-- ALTER SEQUENCE categories_id_seq RESTART WITH 1;

-- =====================================================
-- Insert Kategori Obat untuk Apotik
-- =====================================================

INSERT INTO categories (name, description) VALUES
-- Kategori Obat Berdasarkan Klasifikasi
('Obat Bebas', 'Obat yang dapat dibeli tanpa resep dokter dengan tanda lingkaran hijau'),
('Obat Bebas Terbatas', 'Obat yang dapat dibeli tanpa resep dengan peringatan khusus (lingkaran biru)'),
('Obat Keras', 'Obat yang hanya dapat dibeli dengan resep dokter (lingkaran merah + huruf K)'),
('Obat Generik', 'Obat dengan kandungan zat aktif sama dengan obat paten tapi lebih terjangkau'),

-- Kategori Obat Berdasarkan Fungsi/Jenis
('Antibiotik', 'Obat untuk mengatasi infeksi bakteri, memerlukan resep dokter'),
('Vitamin & Suplemen', 'Produk penunjang kesehatan, vitamin, mineral, dan suplemen makanan'),
('Obat Batuk & Flu', 'Obat untuk mengatasi gejala batuk, pilek, dan influenza'),
('Obat Pencernaan', 'Obat untuk masalah pencernaan seperti maag, diare, sembelit'),
('Obat Diabetes', 'Obat untuk mengontrol kadar gula darah pada penderita diabetes'),
('Obat Jantung & Hipertensi', 'Obat untuk penyakit jantung dan tekanan darah tinggi'),
('Obat Nyeri & Demam', 'Analgesik dan antipiretik untuk meredakan nyeri dan menurunkan demam'),
('Obat Alergi', 'Antihistamin dan obat untuk mengatasi reaksi alergi'),
('Obat Kulit', 'Salep, krim, dan obat topikal untuk masalah kulit'),
('Obat Mata & Telinga', 'Tetes mata, tetes telinga, dan obat oftalmologi'),
('Obat Tradisional & Herbal', 'Jamu, obat herbal, dan produk tradisional untuk kesehatan'),
('Obat Asma & Pernapasan', 'Inhaler, bronkodilator, dan obat untuk gangguan pernapasan'),
('Obat Kolesterol', 'Obat untuk menurunkan kolesterol dan lemak darah'),

-- Kategori Produk Kesehatan
('Alat Kesehatan', 'Peralatan medis seperti tensimeter, termometer, masker, dll'),
('Perawatan Luka', 'Perban, plester, antiseptik, dan produk perawatan luka'),
('Produk Bayi & Anak', 'Obat dan produk kesehatan khusus untuk bayi dan anak-anak'),
('Produk Ibu & Kehamilan', 'Vitamin dan produk kesehatan untuk ibu hamil dan menyusui'),
('Produk Perawatan Pribadi', 'Hand sanitizer, masker, sabun antiseptik, dan produk kebersihan'),
('Multivitamin', 'Suplemen multivitamin dan mineral kompleks'),
('Kontrasepsi & KB', 'Produk keluarga berencana dan alat kontrasepsi');

-- =====================================================
-- Verifikasi hasil
-- =====================================================

-- Tampilkan semua kategori yang baru ditambahkan
-- SELECT * FROM categories ORDER BY name;

-- Hitung jumlah kategori
-- SELECT COUNT(*) as total_categories FROM categories;
