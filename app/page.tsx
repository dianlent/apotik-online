import ProductList from "@/components/ProductList";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Clock, ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Enhanced Gradient */}
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
            Now Open 24/7
          </div>

          <h1 className="text-5xl tracking-tight font-extrabold text-white sm:text-6xl md:text-7xl max-w-4xl animate-fade-in">
            Healthcare Essentials,
            <br />
            <span className="inline-block mt-2 text-blue-100">Delivered to Your Door</span>
          </h1>

          <p className="mt-6 max-w-2xl text-xl text-blue-50 mx-auto leading-relaxed">
            Your trusted online pharmacy for fast, reliable, and secure delivery of medicines and health products. Quality healthcare at your fingertips.
          </p>

          <div className="mt-12 flex gap-4 justify-center flex-wrap">
            <Link
              href="/products"
              className="group inline-flex items-center px-8 py-4 border-2 border-white text-base font-semibold rounded-full text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-blue-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
            >
              <ShoppingBag className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 border-2 border-white/50 text-base font-semibold rounded-full text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Get Started Free
            </Link>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-3 gap-8 text-white">
            <div className="text-center">
              <div className="text-4xl font-bold">500+</div>
              <div className="text-blue-200 text-sm mt-1">Products</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">50K+</div>
              <div className="text-blue-200 text-sm mt-1">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">24/7</div>
              <div className="text-blue-200 text-sm mt-1">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Enhanced Cards */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600">Experience the future of pharmacy services</p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="group bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Authentic</h3>
              <p className="text-gray-600">Guaranteed original products sourced directly from certified manufacturers and distributors.</p>
            </div>

            <div className="group bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl text-green-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">Same-day delivery available for local orders with real-time tracking and updates.</p>
            </div>

            <div className="group bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600">Our expert pharmacists are available round the clock to answer your health queries.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products with Enhanced Design */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-600 mt-2">Explore our most popular healthcare essentials</p>
            </div>
            <Link href="/products" className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
              View all
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <ProductList />
        </div>
      </div>
    </div>
  );
}
