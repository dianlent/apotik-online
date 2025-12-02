-- =====================================================
-- Script AMAN untuk Seed Kategori Apotik
-- Versi ini lebih aman dan tidak menghapus data produk
-- =====================================================

-- OPSI 1: Update produk yang ada agar tidak terhubung ke kategori
-- Uncomment jika Anda ingin memindahkan semua produk ke kategori NULL terlebih dahulu
-- UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL;

-- OPSI 2: Hapus hanya kategori yang tidak memiliki produk
-- DELETE FROM categories WHERE id NOT IN (SELECT DISTINCT category_id FROM products WHERE category_id IS NOT NULL);

-- OPSI 3: Hapus SEMUA kategori (HATI-HATI!)
-- Gunakan ini hanya jika Anda yakin ingin menghapus semua kategori lama
-- DELETE FROM categories;

-- =====================================================
-- CARA PALING AMAN: Insert kategori baru tanpa menghapus yang lama
-- Jika nama kategori sudah ada, akan error (karena unique constraint)
-- Anda bisa menghapus manual kategori lama dari UI setelah ini
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
('Kontrasepsi & KB', 'Produk keluarga berencana dan alat kontrasepsi')
ON CONFLICT (name) DO NOTHING; -- Skip jika nama kategori sudah ada

-- =====================================================
-- Verifikasi hasil
-- =====================================================

-- Tampilkan semua kategori
SELECT id, name, description, created_at 
FROM categories 
ORDER BY name;

-- Hitung jumlah kategori
SELECT COUNT(*) as total_categories FROM categories;

-- Tampilkan kategori dengan jumlah produk
SELECT 
    c.id,
    c.name,
    COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;
