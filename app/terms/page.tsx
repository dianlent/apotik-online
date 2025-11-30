import { FileText, CheckCircle, XCircle, AlertTriangle, Scale } from 'lucide-react'

export const metadata = {
    title: 'Syarat & Ketentuan - Apotik POS',
    description: 'Syarat dan Ketentuan penggunaan layanan Apotik POS',
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 sm:py-16">
                <div className="container-responsive">
                    <div className="max-w-3xl mx-auto text-center">
                        <Scale className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4" />
                        <h1 className="text-responsive-xl font-bold mb-4">Syarat & Ketentuan</h1>
                        <p className="text-responsive-base text-blue-100">
                            Ketentuan penggunaan layanan Apotik POS yang harus Anda pahami dan setujui
                        </p>
                        <p className="text-sm text-blue-200 mt-4">
                            Berlaku efektif: 30 November 2025
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="container-responsive">
                    <div className="flex overflow-x-auto py-4 gap-4 scrollbar-hide">
                        <a href="#penerimaan" className="text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap">
                            Penerimaan
                        </a>
                        <a href="#layanan" className="text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap">
                            Layanan
                        </a>
                        <a href="#akun" className="text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap">
                            Akun
                        </a>
                        <a href="#pemesanan" className="text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap">
                            Pemesanan
                        </a>
                        <a href="#pembayaran" className="text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap">
                            Pembayaran
                        </a>
                        <a href="#tanggung-jawab" className="text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap">
                            Tanggung Jawab
                        </a>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="section-padding">
                <div className="container-responsive max-w-4xl">
                    <div className="space-y-8">
                        {/* Acceptance */}
                        <div id="penerimaan" className="card-responsive bg-white shadow-lg border border-gray-100">
                            <div className="flex items-center mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Penerimaan Syarat</h2>
                            </div>
                            <div className="space-y-4 text-gray-600">
                                <p className="leading-relaxed">
                                    Dengan mengakses dan menggunakan layanan Apotik POS, Anda menyetujui untuk terikat 
                                    dengan Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan syarat ini, mohon 
                                    untuk tidak menggunakan layanan kami.
                                </p>
                                <p className="leading-relaxed">
                                    Kami berhak untuk mengubah, memodifikasi, atau memperbarui syarat ini kapan saja 
                                    tanpa pemberitahuan sebelumnya. Penggunaan berkelanjutan setelah perubahan berarti 
                                    Anda menerima perubahan tersebut.
                                </p>
                            </div>
                        </div>

                        {/* Services */}
                        <div id="layanan" className="card-responsive bg-white shadow-lg border border-gray-100">
                            <div className="flex items-center mb-4">
                                <FileText className="h-6 w-6 text-blue-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Layanan Kami</h2>
                            </div>
                            <div className="space-y-4 text-gray-600">
                                <p>Apotik POS menyediakan:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Platform e-commerce untuk pembelian produk kesehatan dan farmasi</li>
                                    <li>Layanan konsultasi dengan apoteker berlisensi</li>
                                    <li>Informasi produk dan edukasi kesehatan</li>
                                    <li>Layanan pengiriman produk</li>
                                </ul>
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
                                    <div className="flex items-start">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-yellow-800">
                                            <strong>Penting:</strong> Layanan kami tidak menggantikan konsultasi medis profesional. 
                                            Untuk kondisi serius, segera hubungi dokter atau fasilitas kesehatan terdekat.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account */}
                        <div id="akun" className="card-responsive bg-white shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Akun Pengguna</h2>
                            <div className="space-y-4 text-gray-600">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Pendaftaran:</h3>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Anda harus berusia minimal 17 tahun untuk membuat akun</li>
                                        <li>Informasi yang diberikan harus akurat dan lengkap</li>
                                        <li>Anda bertanggung jawab menjaga kerahasiaan password</li>
                                        <li>Satu akun hanya untuk satu orang</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Keamanan Akun:</h3>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Anda bertanggung jawab atas semua aktivitas di akun Anda</li>
                                        <li>Segera laporkan jika akun Anda diakses tanpa izin</li>
                                        <li>Kami tidak bertanggung jawab atas kerugian akibat kelalaian keamanan akun</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Orders */}
                        <div id="pemesanan" className="card-responsive bg-white shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pemesanan & Pengiriman</h2>
                            <div className="space-y-4 text-gray-600">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Proses Pemesanan:</h3>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Pesanan dianggap final setelah pembayaran dikonfirmasi</li>
                                        <li>Kami berhak menolak atau membatalkan pesanan karena alasan tertentu</li>
                                        <li>Harga dan ketersediaan produk dapat berubah tanpa pemberitahuan</li>
                                        <li>Untuk obat keras, diperlukan resep dokter yang valid</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Pengiriman:</h3>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Estimasi waktu pengiriman bersifat perkiraan, bukan jaminan</li>
                                        <li>Risiko kerusakan atau kehilangan selama pengiriman ditanggung kurir</li>
                                        <li>Pastikan alamat pengiriman lengkap dan benar</li>
                                        <li>Produk harus diperiksa saat diterima</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div id="pembayaran" className="card-responsive bg-white shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pembayaran</h2>
                            <div className="space-y-4 text-gray-600">
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Semua harga dalam Rupiah (IDR) dan sudah termasuk PPN</li>
                                    <li>Pembayaran harus dilakukan sesuai metode yang dipilih</li>
                                    <li>Kami tidak menyimpan informasi kartu kredit Anda</li>
                                    <li>Pembayaran diproses oleh payment gateway pihak ketiga yang aman</li>
                                    <li>Pesanan akan diproses setelah pembayaran dikonfirmasi</li>
                                </ul>
                            </div>
                        </div>

                        {/* Returns & Refunds */}
                        <div className="card-responsive bg-white shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pengembalian & Penukaran</h2>
                            <div className="space-y-4 text-gray-600">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Kebijakan Pengembalian:</h3>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Produk dapat dikembalikan dalam 7 hari jika rusak atau tidak sesuai</li>
                                        <li>Produk harus dalam kondisi asli dengan kemasan utuh</li>
                                        <li>Obat-obatan tidak dapat dikembalikan kecuali cacat produksi</li>
                                        <li>Biaya pengiriman pengembalian ditanggung pembeli (kecuali kesalahan kami)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Refund:</h3>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Refund diproses dalam 7-14 hari kerja setelah pengembalian diterima</li>
                                        <li>Refund dikembalikan ke metode pembayaran asli</li>
                                        <li>Biaya admin dan ongkir tidak dapat di-refund</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Liability */}
                        <div id="tanggung-jawab" className="card-responsive bg-white shadow-lg border border-gray-100">
                            <div className="flex items-center mb-4">
                                <XCircle className="h-6 w-6 text-red-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Batasan Tanggung Jawab</h2>
                            </div>
                            <div className="space-y-4 text-gray-600">
                                <p>Apotik POS tidak bertanggung jawab atas:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Reaksi alergi atau efek samping dari penggunaan produk</li>
                                    <li>Kesalahan diagnosis atau pengobatan mandiri</li>
                                    <li>Keterlambatan pengiriman di luar kendali kami</li>
                                    <li>Kerugian tidak langsung atau konsekuensial</li>
                                    <li>Gangguan layanan karena force majeure</li>
                                    <li>Kehilangan data akibat masalah teknis</li>
                                </ul>
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
                                    <p className="text-sm text-red-800">
                                        <strong>Disclaimer:</strong> Tanggung jawab kami terbatas pada nilai pembelian produk. 
                                        Gunakan produk sesuai petunjuk dan konsultasikan dengan profesional kesehatan.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Intellectual Property */}
                        <div className="card-responsive bg-white shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hak Kekayaan Intelektual</h2>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    Semua konten di website ini (teks, gambar, logo, desain) adalah milik Apotik POS 
                                    dan dilindungi oleh hak cipta. Anda tidak diperbolehkan:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Menyalin, memodifikasi, atau mendistribusikan konten tanpa izin</li>
                                    <li>Menggunakan logo atau merek dagang kami</li>
                                    <li>Melakukan scraping atau data mining</li>
                                    <li>Membuat karya turunan dari konten kami</li>
                                </ul>
                            </div>
                        </div>

                        {/* Termination */}
                        <div className="card-responsive bg-white shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Penangguhan & Pemutusan</h2>
                            <div className="space-y-4 text-gray-600">
                                <p>Kami berhak menangguhkan atau menghentikan akses Anda jika:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Melanggar syarat dan ketentuan ini</li>
                                    <li>Memberikan informasi palsu atau menyesatkan</li>
                                    <li>Melakukan aktivitas ilegal atau penipuan</li>
                                    <li>Menyalahgunakan layanan atau mengganggu pengguna lain</li>
                                    <li>Tidak membayar tagihan yang jatuh tempo</li>
                                </ul>
                            </div>
                        </div>

                        {/* Governing Law */}
                        <div className="card-responsive bg-white shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hukum yang Berlaku</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. 
                                Setiap perselisihan akan diselesaikan melalui Pengadilan Negeri Jakarta Pusat.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="card-responsive bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pertanyaan?</h2>
                            <p className="text-gray-600 mb-4">
                                Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, silakan hubungi:
                            </p>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Email:</strong> <a href="mailto:legal@apotikpos.com" className="text-blue-600 hover:underline">legal@apotikpos.com</a></p>
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
