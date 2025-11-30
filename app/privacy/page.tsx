import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'

export const metadata = {
    title: 'Kebijakan Privasi - Apotik POS',
    description: 'Kebijakan Privasi Apotik POS - Bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda',
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 sm:py-16">
                <div className="container-responsive">
                    <div className="max-w-3xl mx-auto text-center">
                        <Shield className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4" />
                        <h1 className="text-responsive-xl font-bold mb-4">Kebijakan Privasi</h1>
                        <p className="text-responsive-base text-blue-100">
                            Kami menghargai privasi Anda dan berkomitmen melindungi data pribadi Anda
                        </p>
                        <p className="text-sm text-blue-200 mt-4">
                            Terakhir diperbarui: 30 November 2025
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="container-responsive">
                    <div className="flex overflow-x-auto py-4 gap-4 scrollbar-hide">
                        <a href="#pengumpulan" className="text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap">
                            Pengumpulan Data
                        </a>
                        <a href="#penggunaan" className="text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap">
                            Penggunaan Data
                        </a>
                        <a href="#perlindungan" className="text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap">
                            Perlindungan Data
                        </a>
                        <a href="#hak" className="text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap">
                            Hak Anda
                        </a>
                        <a href="#cookies" className="text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap">
                            Cookies
                        </a>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="section-padding">
                <div className="container-responsive max-w-4xl">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <div className="card-responsive bg-white shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pendahuluan</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Selamat datang di Apotik POS. Kami menghormati privasi Anda dan berkomitmen untuk melindungi 
                                data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, 
                                menyimpan, dan melindungi informasi Anda saat menggunakan layanan kami.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Dengan menggunakan layanan Apotik POS, Anda menyetujui pengumpulan dan penggunaan informasi 
                                sesuai dengan kebijakan ini.
                            </p>
                        </div>

                        {/* Data Collection */}
                        <div id="pengumpulan" className="card-responsive bg-white shadow-lg border border-gray-100">
                            <div className="flex items-center mb-4">
                                <Database className="h-6 w-6 text-blue-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Pengumpulan Data</h2>
                            </div>
                            <div className="space-y-4 text-gray-600">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Data yang Kami Kumpulkan:</h3>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li><strong>Informasi Identitas:</strong> Nama lengkap, alamat email, nomor telepon</li>
                                        <li><strong>Informasi Pengiriman:</strong> Alamat lengkap, kode pos, catatan alamat</li>
                                        <li><strong>Informasi Pembayaran:</strong> Metode pembayaran (data kartu dienkripsi oleh payment gateway)</li>
                                        <li><strong>Riwayat Transaksi:</strong> Pesanan, pembayaran, dan komunikasi dengan customer service</li>
                                        <li><strong>Data Teknis:</strong> IP address, browser, device information, cookies</li>
                                        <li><strong>Data Kesehatan:</strong> Informasi medis yang Anda berikan saat konsultasi (opsional)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Data Usage */}
                        <div id="penggunaan" className="card-responsive bg-white shadow-lg border border-gray-100">
                            <div className="flex items-center mb-4">
                                <FileText className="h-6 w-6 text-green-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Penggunaan Data</h2>
                            </div>
                            <div className="space-y-4 text-gray-600">
                                <p>Kami menggunakan data Anda untuk:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Memproses dan mengirimkan pesanan Anda</li>
                                    <li>Mengelola akun dan memberikan layanan customer support</li>
                                    <li>Mengirimkan notifikasi terkait pesanan dan promosi (dengan persetujuan Anda)</li>
                                    <li>Meningkatkan pengalaman pengguna dan personalisasi layanan</li>
                                    <li>Mencegah penipuan dan aktivitas ilegal</li>
                                    <li>Mematuhi kewajiban hukum dan regulasi</li>
                                    <li>Analisis dan riset untuk pengembangan layanan</li>
                                </ul>
                            </div>
                        </div>

                        {/* Data Protection */}
                        <div id="perlindungan" className="card-responsive bg-white shadow-lg border border-gray-100">
                            <div className="flex items-center mb-4">
                                <Lock className="h-6 w-6 text-purple-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Perlindungan Data</h2>
                            </div>
                            <div className="space-y-4 text-gray-600">
                                <p>Kami menerapkan langkah-langkah keamanan untuk melindungi data Anda:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                        <h4 className="font-semibold text-gray-900 mb-2">🔒 Enkripsi SSL/TLS</h4>
                                        <p className="text-sm">Semua data ditransmisikan dengan enkripsi</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <h4 className="font-semibold text-gray-900 mb-2">🛡️ Firewall</h4>
                                        <p className="text-sm">Perlindungan dari akses tidak sah</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                        <h4 className="font-semibold text-gray-900 mb-2">👥 Akses Terbatas</h4>
                                        <p className="text-sm">Hanya staff terotorisasi yang dapat akses</p>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                        <h4 className="font-semibold text-gray-900 mb-2">💾 Backup Rutin</h4>
                                        <p className="text-sm">Data di-backup secara berkala</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Rights */}
                        <div id="hak" className="card-responsive bg-white shadow-lg border border-gray-100">
                            <div className="flex items-center mb-4">
                                <UserCheck className="h-6 w-6 text-orange-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Hak Anda</h2>
                            </div>
                            <div className="space-y-4 text-gray-600">
                                <p>Anda memiliki hak untuk:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Akses:</strong> Meminta salinan data pribadi yang kami simpan</li>
                                    <li><strong>Koreksi:</strong> Memperbarui atau memperbaiki data yang tidak akurat</li>
                                    <li><strong>Penghapusan:</strong> Meminta penghapusan data pribadi Anda</li>
                                    <li><strong>Pembatasan:</strong> Membatasi pemrosesan data Anda</li>
                                    <li><strong>Portabilitas:</strong> Menerima data Anda dalam format yang dapat dibaca mesin</li>
                                    <li><strong>Keberatan:</strong> Menolak pemrosesan data untuk tujuan tertentu</li>
                                    <li><strong>Penarikan Persetujuan:</strong> Menarik persetujuan kapan saja</li>
                                </ul>
                                <p className="mt-4">
                                    Untuk menggunakan hak-hak ini, hubungi kami di{' '}
                                    <a href="mailto:privacy@apotikpos.com" className="text-blue-600 hover:underline">
                                        privacy@apotikpos.com
                                    </a>
                                </p>
                            </div>
                        </div>

                        {/* Cookies */}
                        <div id="cookies" className="card-responsive bg-white shadow-lg border border-gray-100">
                            <div className="flex items-center mb-4">
                                <Eye className="h-6 w-6 text-pink-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Cookies dan Teknologi Pelacakan</h2>
                            </div>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    Kami menggunakan cookies dan teknologi serupa untuk meningkatkan pengalaman Anda. 
                                    Cookies adalah file kecil yang disimpan di device Anda.
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Jenis Cookies:</h4>
                                        <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                            <li><strong>Essential Cookies:</strong> Diperlukan untuk fungsi dasar website</li>
                                            <li><strong>Performance Cookies:</strong> Membantu kami memahami penggunaan website</li>
                                            <li><strong>Functional Cookies:</strong> Mengingat preferensi Anda</li>
                                            <li><strong>Marketing Cookies:</strong> Menampilkan iklan yang relevan</li>
                                        </ul>
                                    </div>
                                    <p>
                                        Anda dapat mengatur preferensi cookies melalui browser Anda. Namun, menonaktifkan 
                                        cookies tertentu dapat mempengaruhi fungsionalitas website.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Third Party */}
                        <div className="card-responsive bg-white shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Berbagi Data dengan Pihak Ketiga</h2>
                            <div className="space-y-4 text-gray-600">
                                <p>Kami dapat berbagi data Anda dengan:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Payment Gateway:</strong> Untuk memproses pembayaran (Duitku, dll)</li>
                                    <li><strong>Kurir:</strong> Untuk pengiriman pesanan (JNE, J&T, dll)</li>
                                    <li><strong>Cloud Service:</strong> Untuk penyimpanan data (AWS, Google Cloud)</li>
                                    <li><strong>Analytics:</strong> Untuk analisis website (Google Analytics)</li>
                                    <li><strong>Pihak Berwenang:</strong> Jika diwajibkan oleh hukum</li>
                                </ul>
                                <p className="mt-4">
                                    Semua pihak ketiga diwajibkan untuk melindungi data Anda sesuai standar keamanan kami.
                                </p>
                            </div>
                        </div>

                        {/* Changes */}
                        <div className="card-responsive bg-white shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Perubahan Kebijakan</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan 
                                diumumkan di halaman ini dengan tanggal "Terakhir diperbarui" yang baru. Kami 
                                mendorong Anda untuk meninjau kebijakan ini secara berkala.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="card-responsive bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
                            <p className="text-gray-600 mb-4">
                                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi:
                            </p>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Email:</strong> <a href="mailto:privacy@apotikpos.com" className="text-blue-600 hover:underline">privacy@apotikpos.com</a></p>
                                <p><strong>Telepon:</strong> <a href="tel:+6281234567890" className="text-blue-600 hover:underline">+62 812-3456-7890</a></p>
                                <p><strong>Alamat:</strong> Jl. Kesehatan No. 123, Jakarta Pusat, 10110</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
