# 🏥 Pharmacy POS & E-Commerce System

A modern, full-featured Point of Sale (POS) and e-commerce platform for pharmacies, built with Next.js 16, React 19, and Supabase. Features include online shopping, cashier system, admin dashboard, payment gateway integration, and comprehensive inventory management.

## ✨ Features

### 🛒 Customer Features
- **Online Shopping**: Browse and purchase medicines and health products
- **Product Catalog**: Advanced search, filtering, and categorization
- **Shopping Cart**: Add, remove, and manage items with real-time updates
- **Secure Checkout**: Multiple payment methods including QRIS, Virtual Account, and more
- **Order Tracking**: Real-time order status updates
- **User Authentication**: Secure registration and login system
- **Responsive Design**: Modern UI that works on all devices

### 💳 Payment Integration
- **Duitku Payment Gateway**: Support for multiple payment methods
  - QRIS (Quick Response Code Indonesian Standard)
  - Virtual Account (BCA, BNI, Mandiri, BRI, etc.)
  - Credit/Debit Cards
  - E-Wallets (OVO, Dana, LinkAja, ShopeePay)
- **Payment Callback**: Automated order status updates
- **Payment Verification**: Secure signature validation
- **Sandbox Mode**: Test payments without real transactions

### 🏪 Cashier (Kasir) System
- **Point of Sale Interface**: Fast and efficient checkout process
- **Barcode Scanning**: Quick product lookup and entry
- **Cash Register**: Cash, card, and digital payment processing
- **Receipt Generation**: Print or digital receipts
- **Transaction History**: View and search past transactions
- **Quick Product Search**: Real-time search with autocomplete

### 👨‍💼 Admin Dashboard
- **Product Management**: Add, edit, delete, and manage products
- **Category Management**: Organize products into categories
- **Inventory Tracking**: Monitor stock levels and get low-stock alerts
- **Stock Opname Management**: Run physical count sessions, capture variance, and sync back to system stock
- **Order Management**: View, process, and fulfill orders
- **User Management**: Manage customers and staff accounts
- **Delivery Management**: Track and manage deliveries
- **Sales Reports**: Comprehensive analytics and reporting
  - Daily, weekly, monthly sales reports
  - Revenue analytics with charts
  - Best-selling products
  - Customer insights
- **Settings**: Configure payment gateway, shipping, and system settings

### 🔐 Authentication & Authorization
- **Role-Based Access Control**: Admin, Kasir, and Customer roles
- **Supabase Auth**: Secure authentication system
- **Protected Routes**: Route guards for admin and cashier areas
- **Password Reset**: Secure password recovery system
- **Profile Management**: Users can manage their profiles

## 🛠️ Tech Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: Latest React with Compiler enabled
- **TypeScript**: Type-safe development
- **TailwindCSS 4**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Chart.js**: Data visualization for reports
- **JsBarcode**: Barcode generation

### Backend & Database
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)
- **Next.js API Routes**: Serverless functions
- **Supabase SSR**: Server-side rendering with authentication

### Payment Gateway
- **Duitku**: Indonesian payment gateway integration
  - QRIS support
  - Virtual Account support
  - Multiple payment channels

### DevOps & Deployment
- **Vercel**: Hosting and deployment
- **GitHub**: Version control
- **Environment Variables**: Secure configuration management

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Supabase account
- Duitku merchant account (for payment processing)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pos-apotik
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Duitku Payment Gateway (Optional - can be configured via admin panel)
NEXT_PUBLIC_DUITKU_MERCHANT_CODE=your-merchant-code
NEXT_PUBLIC_DUITKU_API_KEY=your-api-key
NEXT_PUBLIC_DUITKU_SANDBOX=true
```

### 4. Database Setup

#### Option A: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Option B: Manual Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files in order from `supabase/migrations/`
4. Or run the complete schema from `supabase/schema.sql`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
pos-apotik/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin dashboard pages
│   │   ├── categories/     # Category management
│   │   ├── delivery/       # Delivery management
│   │   ├── inventory/      # Inventory tracking
│   │   ├── stock-opname/   # Stock opname management
│   │   ├── orders/         # Order management
│   │   ├── products/       # Product management
│   │   ├── reports/        # Sales reports & analytics
│   │   ├── settings/       # System settings
│   │   └── users/          # User management
│   ├── api/                # API routes
│   │   └── payment/        # Payment gateway endpoints
│   ├── cart/               # Shopping cart page
│   ├── checkout/           # Checkout page
│   ├── kasir/              # Cashier/POS interface
│   ├── login/              # Login page
│   ├── products/           # Product catalog
│   ├── register/           # Customer registration
│   ├── register-kasir/     # Cashier registration
│   ├── forgot-password/    # Password recovery
│   ├── reset-password/     # Password reset
│   ├── page.tsx            # Homepage
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── admin/              # Admin components
│   ├── kasir/              # Cashier components
│   ├── AuthGuard.tsx       # Authentication guard
│   ├── Cart.tsx            # Shopping cart component
│   ├── Checkout.tsx        # Checkout component
│   ├── LoginForm.tsx       # Login form
│   ├── Navbar.tsx          # Navigation bar
│   ├── ProductList.tsx     # Product listing
│   └── RegisterForm.tsx    # Registration form
├── context/                 # React Context
│   ├── AuthContext.tsx     # Authentication context
│   ├── CartContext.tsx     # Shopping cart context
│   └── SettingsContext.tsx # App settings context
├── lib/                     # Utility libraries
│   ├── duitku.ts           # Duitku payment integration
│   └── supabase/           # Supabase client
├── types/                   # TypeScript type definitions
├── supabase/               # Database schema & migrations
│   ├── migrations/         # SQL migration files
│   └── schema.sql          # Complete database schema
├── public/                  # Static assets
├── vercel.json             # Vercel deployment config
├── next.config.ts          # Next.js configuration
├── tailwind.config.js      # TailwindCSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## 🗄️ Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

- **profiles**: User profiles with role-based access
- **categories**: Product categories
- **products**: Product catalog with inventory
- **orders**: Customer orders
- **order_items**: Order line items
- **payments**: Payment transactions
- **stock_opname_sessions**: Stock opname sessions (physical stock counts)
- **stock_opname_items**: Product-level entries inside stock opname sessions
- **carts**: Shopping cart items
- **cart_items**: Cart line items

All tables include Row Level Security (RLS) policies for data protection.

## 🔐 Authentication & Roles

### User Roles
- **admin**: Full system access
- **kasir**: Access to POS system and order management
- **customer**: Access to shopping and orders

### Protected Routes
- `/admin/*`: Admin only
- `/kasir/*`: Kasir and Admin only
- `/cart`, `/checkout`: Authenticated users only

## 💳 Payment Gateway Setup

### Duitku Configuration

1. Register at [Duitku](https://duitku.com/)
2. Get your Merchant Code and API Key
3. Configure in Admin Dashboard → Settings → Payment
4. Set callback and return URLs:
   - Callback: `https://your-domain.com/api/payment/callback`
   - Return: `https://your-domain.com/payment/success`
5. Enable sandbox mode for testing

### Supported Payment Methods
- QRIS (All banks)
- Virtual Account (BCA, BNI, Mandiri, BRI, Permata, etc.)
- Credit/Debit Cards (Visa, Mastercard, JCB)
- E-Wallets (OVO, Dana, LinkAja, ShopeePay)

## 📊 Admin Features

### Dashboard
- Sales overview with charts
- Recent orders
- Low stock alerts
- Revenue analytics

### Product Management
- Add/Edit/Delete products
- Bulk import/export
- Image upload
- Stock tracking
- Barcode generation
- Category assignment

### Order Management
- View all orders
- Update order status
- Print invoices
- Refund processing

### Reports
- Daily sales reports
- Revenue analytics
- Best-selling products
- Customer insights
- Inventory reports

## 🖨️ Cashier/POS Features

- Fast product search
- Barcode scanning support
- Quick checkout
- Multiple payment methods
- Receipt printing
- Transaction history
- Cash register management

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above
2. Connect your GitHub repository
3. Add environment variables
4. Deploy!

### Environment Variables for Production

```bash
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_DUITKU_MERCHANT_CODE=your-merchant-code
NEXT_PUBLIC_DUITKU_API_KEY=your-api-key
NEXT_PUBLIC_DUITKU_SANDBOX=false
```

## 🧪 Testing

### Payment Testing (Sandbox Mode)

Set `NEXT_PUBLIC_DUITKU_SANDBOX=true` to use sandbox environment.

Test credentials and card numbers are available in the Duitku documentation.

## 🔧 Configuration

### Payment Gateway
Configure in Admin Dashboard → Settings → Payment

### Shipping & Delivery
Configure in Admin Dashboard → Settings → Delivery

### General Settings
Configure in Admin Dashboard → Settings → General

## 📝 Development Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
- Ensure all environment variables are set
- Check that Supabase connection is working
- Verify Node.js version (20.x+)

**Payment Gateway Issues**
- Verify Duitku credentials
- Check callback URL is registered in Duitku dashboard
- Ensure signature generation is correct
- Check Duitku logs for detailed errors

**Database Connection**
- Verify Supabase URL and keys
- Check RLS policies are correctly set
- Ensure migrations have run successfully

**Authentication Issues**
- Clear browser cache and cookies
- Check Supabase Auth settings
- Verify email confirmation is enabled/disabled as needed

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Duitku API Documentation](https://docs.duitku.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Support

For support and questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review Supabase dashboard logs
- Check Vercel function logs
- Review Duitku transaction logs

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Prescription upload and verification
- [ ] WhatsApp integration for order notifications
- [ ] Loyalty program
- [ ] Multi-branch support
- [ ] Advanced inventory forecasting
- [ ] Integration with more payment gateways
- [ ] Customer reviews and ratings
- [ ] Telemedicine integration

## 🏆 Features Highlights

✅ Modern UI/UX with TailwindCSS  
✅ Real-time updates with Supabase  
✅ Secure payment processing  
✅ Role-based access control  
✅ Comprehensive admin dashboard  
✅ POS/Cashier system  
✅ Mobile responsive  
✅ Fast and optimized  
✅ Production-ready  

---

Built with ❤️ using Next.js and Supabase
