import { createClient } from '@/lib/supabase/client'

export const pharmacyCategories = [
    {
        name: 'Obat Bebas',
        description: 'Obat yang dapat dibeli tanpa resep dokter dengan tanda lingkaran hijau'
    },
    {
        name: 'Obat Bebas Terbatas',
        description: 'Obat yang dapat dibeli tanpa resep dengan peringatan khusus (lingkaran biru)'
    },
    {
        name: 'Obat Keras',
        description: 'Obat yang hanya dapat dibeli dengan resep dokter (lingkaran merah + huruf K)'
    },
    {
        name: 'Obat Generik',
        description: 'Obat dengan kandungan zat aktif sama dengan obat paten tapi lebih terjangkau'
    },
    {
        name: 'Antibiotik',
        description: 'Obat untuk mengatasi infeksi bakteri, memerlukan resep dokter'
    },
    {
        name: 'Vitamin & Suplemen',
        description: 'Produk penunjang kesehatan, vitamin, mineral, dan suplemen makanan'
    },
    {
        name: 'Obat Batuk & Flu',
        description: 'Obat untuk mengatasi gejala batuk, pilek, dan influenza'
    },
    {
        name: 'Obat Pencernaan',
        description: 'Obat untuk masalah pencernaan seperti maag, diare, sembelit'
    },
    {
        name: 'Obat Diabetes',
        description: 'Obat untuk mengontrol kadar gula darah pada penderita diabetes'
    },
    {
        name: 'Obat Jantung & Hipertensi',
        description: 'Obat untuk penyakit jantung dan tekanan darah tinggi'
    },
    {
        name: 'Obat Nyeri & Demam',
        description: 'Analgesik dan antipiretik untuk meredakan nyeri dan menurunkan demam'
    },
    {
        name: 'Obat Alergi',
        description: 'Antihistamin dan obat untuk mengatasi reaksi alergi'
    },
    {
        name: 'Obat Kulit',
        description: 'Salep, krim, dan obat topikal untuk masalah kulit'
    },
    {
        name: 'Obat Mata & Telinga',
        description: 'Tetes mata, tetes telinga, dan obat oftalmologi'
    },
    {
        name: 'Obat Tradisional & Herbal',
        description: 'Jamu, obat herbal, dan produk tradisional untuk kesehatan'
    },
    {
        name: 'Alat Kesehatan',
        description: 'Peralatan medis seperti tensimeter, termometer, masker, dll'
    },
    {
        name: 'Perawatan Luka',
        description: 'Perban, plester, antiseptik, dan produk perawatan luka'
    },
    {
        name: 'Produk Bayi & Anak',
        description: 'Obat dan produk kesehatan khusus untuk bayi dan anak-anak'
    },
    {
        name: 'Produk Ibu & Kehamilan',
        description: 'Vitamin dan produk kesehatan untuk ibu hamil dan menyusui'
    },
    {
        name: 'Produk Perawatan Pribadi',
        description: 'Hand sanitizer, masker, sabun antiseptik, dan produk kebersihan'
    },
    {
        name: 'Obat Asma & Pernapasan',
        description: 'Inhaler, bronkodilator, dan obat untuk gangguan pernapasan'
    },
    {
        name: 'Multivitamin',
        description: 'Suplemen multivitamin dan mineral kompleks'
    },
    {
        name: 'Kontrasepsi & KB',
        description: 'Produk keluarga berencana dan alat kontrasepsi'
    },
    {
        name: 'Obat Kolesterol',
        description: 'Obat untuk menurunkan kolesterol dan lemak darah'
    }
]

export async function seedPharmacyCategories() {
    const supabase = createClient()
    
    try {
        console.log('Starting to seed pharmacy categories...')
        
        // Check existing categories
        const { data: existingCategories } = await supabase
            .from('categories')
            .select('name')
        
        const existingNames = new Set(existingCategories?.map(cat => cat.name) || [])
        
        // Filter out categories that already exist
        const newCategories = pharmacyCategories.filter(
            cat => !existingNames.has(cat.name)
        )
        
        if (newCategories.length === 0) {
            console.log('All categories already exist!')
            return { success: true, added: 0, message: 'Semua kategori sudah ada' }
        }
        
        // Insert new categories
        const { data, error } = await supabase
            .from('categories')
            .insert(newCategories)
            .select()
        
        if (error) throw error
        
        console.log(`Successfully added ${newCategories.length} categories`)
        return { 
            success: true, 
            added: newCategories.length,
            message: `Berhasil menambahkan ${newCategories.length} kategori`
        }
    } catch (error) {
        console.error('Error seeding categories:', error)
        return { 
            success: false, 
            error: error,
            message: 'Gagal menambahkan kategori'
        }
    }
}
