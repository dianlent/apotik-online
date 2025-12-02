import ProductList from "@/components/ProductList";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Clock, ShoppingBag, Heart, Pill, Stethoscope } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden shadow-2xl">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 border border-white/30">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            🏥 Buka 24 Jam
          </div>

          <h1 className="text-5xl tracking-tight font-extrabold text-white sm:text-6xl md:text-7xl max-w-4xl animate-fade-in">
            Apotek Online
            <br />
            <span className="inline-block mt-2 text-blue-100">Terpercaya & Terlengkap</span>
          </h1>

          <p className="mt-6 max-w-2xl text-xl text-blue-50 mx-auto leading-relaxed">
            Solusi kesehatan keluarga Anda. Pesan obat dan produk kesehatan dengan mudah, cepat, dan aman. Pengiriman langsung ke rumah Anda.
          </p>

          <div className="mt-12 flex gap-4 justify-center flex-wrap">
            <Link
              href="/products"
              className="group inline-flex items-center px-8 py-4 border-2 border-white text-base font-semibold rounded-full text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-blue-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
            >
              <ShoppingBag className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              Belanja Sekarang
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 border-2 border-white/50 text-base font-semibold rounded-full text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Daftar Gratis
            </Link>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-3 gap-8 text-white">
            <div className="text-center">
              <div className="text-4xl font-bold">500+</div>
              <div className="text-blue-200 text-sm mt-1">Produk Tersedia</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">10K+</div>
              <div className="text-blue-200 text-sm mt-1">Pelanggan Puas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">24/7</div>
              <div className="text-blue-200 text-sm mt-1">Layanan Konsultasi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Mengapa Memilih Kami?</h2>
            <p className="text-xl text-gray-600">Layanan apotek online terbaik untuk kesehatan Anda</p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="group bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Produk Asli</h3>
              <p className="text-gray-600">Semua produk dijamin asli dan berkualitas, langsung dari distributor resmi dan produsen terpercaya.</p>
            </div>

            <div className="group bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl text-green-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pengiriman Cepat</h3>
              <p className="text-gray-600">Layanan pengiriman same-day untuk area lokal. Lacak pesanan Anda secara real-time.</p>
            </div>

            <div className="group bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Stethoscope className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Konsultasi Apoteker</h3>
              <p className="text-gray-600">Tim apoteker profesional siap membantu menjawab pertanyaan kesehatan Anda kapan saja.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategori Produk</h2>
            <p className="text-gray-600">Temukan produk kesehatan yang Anda butuhkan</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/products?category=obat" className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Pill className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Obat-obatan</h3>
              <p className="text-sm text-gray-600 mt-1">Obat resep & bebas</p>
            </Link>

            <Link href="/products?category=vitamin" className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Vitamin & Suplemen</h3>
              <p className="text-sm text-gray-600 mt-1">Jaga daya tahan tubuh</p>
            </Link>

            <Link href="/products?category=alat" className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stethoscope className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Alat Kesehatan</h3>
              <p className="text-sm text-gray-600 mt-1">Tensimeter, termometer, dll</p>
            </Link>

            <Link href="/products?category=perawatan" className="group p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-100 hover:shadow-lg transition-all text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Perawatan Tubuh</h3>
              <p className="text-sm text-gray-600 mt-1">Skincare & bodycare</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">Produk Unggulan</h2>
              <p className="text-gray-600 mt-2">Produk kesehatan terlaris dan paling diminati</p>
            </div>
            <Link href="/products" className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
              Lihat Semua
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <ProductList />
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siap Menjaga Kesehatan Keluarga?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Daftar sekarang dan dapatkan penawaran spesial untuk pembelian pertama Anda!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Daftar Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all"
            >
              Lihat Produk
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">Produk BPOM</p>
              <p className="text-sm text-gray-600">Terdaftar resmi</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-semibold text-gray-900">Gratis Ongkir</p>
              <p className="text-sm text-gray-600">Min. belanja Rp 100rb</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-semibold text-gray-900">Pengiriman Cepat</p>
              <p className="text-sm text-gray-600">Same day delivery</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <p className="font-semibold text-gray-900">Garansi Asli</p>
              <p className="text-sm text-gray-600">100% original</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
