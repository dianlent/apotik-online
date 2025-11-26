import ProductList from '@/components/ProductList'

export default function ProductsPage() {
    return (
        <div className="space-y-10">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
                </div>
            </div>
            <ProductList />
        </div>
    )
}
