# Order Number Migration

## 📋 Overview

Migration ini menambahkan kolom `order_number` yang lebih simple dan mudah dibaca untuk ID pesanan.

### Format Order Number

```
ORD-YYYYMMDD-XXX
```

**Contoh:**
- `ORD-20241202-001` - Pesanan pertama tanggal 2 Desember 2024
- `ORD-20241202-002` - Pesanan kedua tanggal 2 Desember 2024
- `ORD-20241203-001` - Pesanan pertama tanggal 3 Desember 2024 (counter reset)

### Keuntungan

✅ **Mudah dibaca** - Format yang jelas dan terstruktur  
✅ **Sortable** - Bisa diurutkan berdasarkan tanggal  
✅ **Unique** - Setiap pesanan punya nomor unik  
✅ **Daily counter** - Counter reset setiap hari  
✅ **Auto-generated** - Otomatis dibuat saat insert order baru

## 🚀 Cara Menjalankan Migration

### 1. Via Supabase Dashboard

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Buka **SQL Editor**
4. Copy isi file `add-order-number.sql`
5. Paste dan klik **Run**

### 2. Via psql (Command Line)

```bash
psql -h [HOST] -U postgres -d postgres -f add-order-number.sql
```

### 3. Via Supabase CLI

```bash
supabase db push
```

## 📊 Apa yang Dilakukan Migration?

1. ✅ Menambahkan kolom `order_number` ke tabel `orders`
2. ✅ Membuat function `generate_order_number()` untuk generate nomor otomatis
3. ✅ Membuat trigger untuk auto-generate saat insert order baru
4. ✅ Update semua order yang sudah ada dengan order number
5. ✅ Membuat index untuk performa query lebih cepat

## 🔍 Verifikasi

Setelah migration, jalankan query ini untuk verifikasi:

```sql
SELECT 
    order_number,
    id,
    created_at,
    status,
    total
FROM orders
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Output:**
```
order_number      | id                                   | created_at          | status    | total
------------------|--------------------------------------|---------------------|-----------|--------
ORD-20241202-003  | 92b31667-a1b2-4c3d-8e9f-123456789abc | 2024-12-02 15:30:00 | paid      | 150000
ORD-20241202-002  | 83a20556-b2c3-5d4e-9f0a-234567890bcd | 2024-12-02 14:15:00 | shipped   | 200000
ORD-20241202-001  | 74b19445-c3d4-6e5f-0a1b-345678901cde | 2024-12-02 10:00:00 | completed | 100000
```

## 🎨 Frontend Display

### Before (UUID)
```
ID Pesanan: 92b31667...
```

### After (Order Number)
```
ORD-20241202-001
```

## 🔄 Rollback (Jika Diperlukan)

Jika ingin rollback migration:

```sql
-- Drop trigger
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;

-- Drop functions
DROP FUNCTION IF EXISTS set_order_number();
DROP FUNCTION IF EXISTS generate_order_number();

-- Drop sequence
DROP SEQUENCE IF EXISTS order_number_seq;

-- Remove column
ALTER TABLE orders DROP COLUMN IF EXISTS order_number;
```

## 📝 Notes

- Order number akan otomatis di-generate untuk order baru
- Order lama akan di-update dengan nomor berdasarkan tanggal pembuatan
- Counter reset setiap hari (mulai dari 001)
- Format bisa diubah di function `generate_order_number()` jika diperlukan

## 🐛 Troubleshooting

### Error: "column order_number already exists"
Migration sudah pernah dijalankan. Skip atau jalankan rollback dulu.

### Order number tidak muncul di frontend
Pastikan sudah refresh browser atau restart dev server.

### Order number duplikat
Jalankan query ini untuk fix:
```sql
SELECT generate_order_number();
```

## 📞 Support

Jika ada masalah, check:
1. Supabase logs
2. Browser console
3. Network tab untuk API errors
