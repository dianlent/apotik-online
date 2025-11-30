import { ShieldCheck, Heart, Users, Award, Clock, MapPin } from 'lucide-react'
import Image from 'next/image'

export const metadata = {
    title: 'Tentang Kami - Apotik POS',
    description: 'Pelajari lebih lanjut tentang Apotik POS, misi kami, dan komitmen kami untuk kesehatan Anda',
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white section-padding">
                <div className="container-responsive">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-responsive-xl font-bold mb-4 sm:mb-6">Tentang Apotik POS</h1>
                        <p className="text-responsive-base text-blue-100">
                            Platform terpercaya untuk kebutuhan kesehatan Anda dengan layanan terbaik dan produk berkualitas
                        </p>
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="section-padding">
                <div className="container-responsive">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        <div className="card-responsive bg-white shadow-lg border border-gray-100">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                    <Award className="h-8 w-8 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Misi Kami</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Menyediakan akses mudah dan cepat ke produk kesehatan berkualitas tinggi dengan harga terjangkau. 
                                Kami berkomitmen untuk meningkatkan kualitas hidup masyarakat melalui layanan farmasi yang profesional 
                                dan terpercaya.
                            </p>
                        </div>

                        <div className="card-responsive bg-white shadow-lg border border-gray-100">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-green-100 rounded-lg mr-4">
                                    <Heart className="h-8 w-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Visi Kami</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Menjadi platform kesehatan digital terdepan di Indonesia yang mengintegrasikan teknologi modern 
                                dengan layanan farmasi profesional, menciptakan ekosistem kesehatan yang mudah diakses oleh semua 
                                kalangan masyarakat.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="bg-white py-12 sm:py-16">
                <div className="container-responsive">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-responsive-lg font-bold text-gray-900 mb-4">Nilai-Nilai Kami</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Prinsip yang kami pegang teguh dalam setiap layanan
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        <div className="text-center p-6 sm:p-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                            <div className="inline-flex p-4 bg-blue-600 rounded-full mb-4">
                                <ShieldCheck className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Terpercaya</h3>
                            <p className="text-gray-600 text-sm">
                                Produk 100% original dengan sertifikasi resmi dari BPOM
                            </p>
                        </div>

                        <div className="text-center p-6 sm:p-8 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                            <div className="inline-flex p-4 bg-green-600 rounded-full mb-4">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Profesional</h3>
                            <p className="text-gray-600 text-sm">
                                Tim apoteker berpengalaman siap membantu konsultasi Anda
                            </p>
                        </div>

                        <div className="text-center p-6 sm:p-8 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                            <div className="inline-flex p-4 bg-purple-600 rounded-full mb-4">
                                <Clock className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Cepat & Responsif</h3>
                            <p className="text-gray-600 text-sm">
                                Layanan 24/7 dengan pengiriman same-day delivery
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="section-padding bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="container-responsive">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">10K+</div>
                            <div className="text-blue-100 text-sm sm:text-base">Pelanggan Puas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">5K+</div>
                            <div className="text-blue-100 text-sm sm:text-base">Produk Tersedia</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">50+</div>
                            <div className="text-blue-100 text-sm sm:text-base">Kota Terjangkau</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">24/7</div>
                            <div className="text-blue-100 text-sm sm:text-base">Layanan Aktif</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location */}
            <div className="section-padding">
                <div className="container-responsive">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-responsive-lg font-bold text-gray-900 mb-4">Lokasi Kami</h2>
                            <p className="text-gray-600">Kunjungi toko kami untuk konsultasi langsung</p>
                        </div>

                        <div className="card-responsive bg-white shadow-lg border border-gray-100">
                            <div className="flex items-start mb-6">
                                <MapPin className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Apotik POS - Pusat</h3>
                                    <p className="text-gray-600 mb-4">
                                        Jl. Kesehatan No. 123<br />
                                        Jakarta Pusat, DKI Jakarta 10110<br />
                                        Indonesia
                                    </p>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p><strong>Telepon:</strong> +62 812-3456-7890</p>
                                        <p><strong>Email:</strong> info@apotikpos.com</p>
                                        <p><strong>Jam Operasional:</strong></p>
                                        <p>Senin - Jumat: 08:00 - 22:00</p>
                                        <p>Sabtu - Minggu: 09:00 - 21:00</p>
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                <p className="text-gray-500">Google Maps Integration</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
