# Database Setup & Seeds - Apotik POS

Folder ini berisi script SQL untuk setup database dan mengelola data apotik.

## ⚠️ PENTING: Urutan Eksekusi

**Jalankan script dalam urutan ini:**

1. **`01-create-tables.sql`** ← **WAJIB DIJALANKAN PERTAMA!**
   - Membuat semua table yang diperlukan
   - Membuat indexes untuk performa
   - Setup Row Level Security (RLS)
   - Insert default settings

2. **`seed-pharmacy-categories-safe.sql`** ← **Jalankan setelah table dibuat**
   - Menambahkan 24 kategori obat

## 📁 File yang Tersedia

### 1. `01-create-tables.sql` ⭐ **WAJIB PERTAMA**
Script untuk **membuat struktur database lengkap**:
- ✅ Table: categories, products, orders, order_items, profiles
- ✅ Table: vendors, inventory_logs, settings
- ✅ Indexes untuk performa query
- ✅ Triggers untuk auto-update timestamp
- ✅ Row Level Security (RLS) policies
- ✅ Default settings

**WAJIB dijalankan pertama kali sebelum script lainnya!**

### 2. `seed-pharmacy-categories.sql`
Script untuk **menghapus semua kategori lama** dan menambahkan 24 kategori baru untuk apotik.

⚠️ **PERINGATAN**: Script ini akan menghapus SEMUA kategori yang ada!

**Gunakan jika:**
- Database masih kosong/baru
- Anda yakin ingin menghapus semua kategori lama
- Tidak ada produk yang terhubung ke kategori

### 3. `seed-pharmacy-categories-safe.sql` ✅ **RECOMMENDED**
Script yang lebih **AMAN** dengan beberapa opsi:

**Fitur:**
- ✅ Tidak menghapus kategori secara otomatis
- ✅ Menggunakan `ON CONFLICT DO NOTHING` untuk skip duplikasi
- ✅ Query verifikasi untuk cek hasil
- ✅ Opsi komentar untuk berbagai skenario

**Gunakan jika:**
- Database sudah memiliki data
- Ingin menambahkan kategori tanpa menghapus yang lama
- Lebih aman untuk production

---

## 🚀 Cara Menggunakan

### Opsi 1: Via Supabase Dashboard (Recommended)

**LANGKAH 1: Buat Table (WAJIB)**
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar
4. Klik **New Query**
5. Copy-paste isi file **`01-create-tables.sql`**
6. Klik **Run** untuk eksekusi
7. ✅ Tunggu sampai selesai (akan ada notifikasi success)

**LANGKAH 2: Seed Kategori**
1. Buat query baru di SQL Editor
2. Copy-paste isi file **`seed-pharmacy-categories-safe.sql`**
3. Klik **Run**
4. ✅ 24 kategori berhasil ditambahkan!

### Opsi 2: Via Supabase CLI

```bash
# Pastikan Supabase CLI sudah terinstall
npm install -g supabase

# Login ke Supabase
supabase login

# Link ke project
supabase link --project-ref your-project-ref

# LANGKAH 1: Buat table (WAJIB)
supabase db execute -f database/01-create-tables.sql

# LANGKAH 2: Seed kategori
supabase db execute -f database/seed-pharmacy-categories-safe.sql
```

### Opsi 3: Via psql (PostgreSQL Client)

```bash
# LANGKAH 1: Buat table
psql "postgresql://[user]:[password]@[host]:[port]/[database]" -f 01-create-tables.sql

# LANGKAH 2: Seed kategori
psql "postgresql://[user]:[password]@[host]:[port]/[database]" -f seed-pharmacy-categories-safe.sql
```

---

## 🗄️ Struktur Database yang Dibuat

### Tables:
1. **categories** - Kategori produk obat
2. **products** - Data produk obat
3. **profiles** - Profile user (extends auth.users)
4. **orders** - Pesanan customer
5. **order_items** - Item dalam pesanan
6. **vendors** - Data supplier/vendor
7. **inventory_logs** - Log perubahan stok
8. **settings** - Pengaturan aplikasi

### Features:
- ✅ UUID sebagai primary key
- ✅ Auto-update timestamp dengan triggers
- ✅ Foreign key relationships
- ✅ Indexes untuk performa optimal
- ✅ Row Level Security (RLS) policies
- ✅ Default settings (store info, tax, currency)

---

## 📋 Daftar 24 Kategori yang Akan Ditambahkan

### Kategori Obat (17)
1. Obat Bebas
2. Obat Bebas Terbatas
3. Obat Keras
4. Obat Generik
5. Antibiotik
6. Obat Batuk & Flu
7. Obat Pencernaan
8. Obat Diabetes
9. Obat Jantung & Hipertensi
10. Obat Nyeri & Demam
11. Obat Alergi
12. Obat Kulit
13. Obat Mata & Telinga
14. Obat Tradisional & Herbal
15. Obat Asma & Pernapasan
16. Obat Kolesterol
17. Multivitamin

### Kategori Produk Kesehatan (7)
18. Vitamin & Suplemen
19. Alat Kesehatan
20. Perawatan Luka
21. Produk Bayi & Anak
22. Produk Ibu & Kehamilan
23. Produk Perawatan Pribadi
24. Kontrasepsi & KB

---

## 🔧 Troubleshooting

### Error: "relation 'categories' does not exist"
**Penyebab:** Table belum dibuat di database.

**Solusi:**
1. ⚠️ Jalankan **`01-create-tables.sql`** terlebih dahulu!
2. Baru kemudian jalankan seed scripts

### Error: "duplicate key value violates unique constraint"
**Penyebab:** Kategori dengan nama yang sama sudah ada.

**Solusi:**
- Gunakan `seed-pharmacy-categories-safe.sql` yang sudah menangani duplikasi
- Atau hapus kategori lama terlebih dahulu via UI

### Error: "update or delete on table violates foreign key constraint"
**Penyebab:** Ada produk yang masih terhubung ke kategori yang akan dihapus.

**Solusi:**
```sql
-- Set category_id produk menjadi NULL terlebih dahulu
UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL;

-- Atau pindahkan ke kategori lain
UPDATE products 
SET category_id = 'new-category-id' 
WHERE category_id = 'old-category-id';
```

---

## 💡 Tips

1. **Backup dulu** - Selalu backup database sebelum menjalankan script yang menghapus data
2. **Test di development** - Coba di database development terlebih dahulu
3. **Gunakan versi safe** - Lebih baik gunakan `seed-pharmacy-categories-safe.sql`
4. **Verifikasi hasil** - Jalankan query verifikasi setelah import untuk memastikan data benar

---

## 📞 Alternatif: Import via UI

Jika tidak nyaman dengan SQL, Anda bisa menggunakan tombol **"Import Kategori Default"** yang sudah tersedia di halaman **Admin → Categories** pada aplikasi.

Fitur ini lebih aman karena:
- ✅ Tidak akan menduplikasi kategori
- ✅ Memberikan feedback langsung
- ✅ Tidak perlu akses langsung ke database
- ✅ User-friendly

---

## 📝 Notes

- Script SQL ini dirancang untuk PostgreSQL (Supabase)
- Pastikan table `categories` sudah ada di database
- Field yang digunakan: `id`, `name`, `description`, `created_at`
- `created_at` akan otomatis diisi oleh database (default: now())
