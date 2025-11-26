# Deployment Guide - Vercel

## Prerequisites

- Vercel account
- Supabase project
- Pakasir account (optional for payment gateway)

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Pakasir (can be set via admin panel)
NEXT_PUBLIC_PAKASIR_MERCHANT_CODE=your_merchant_code
NEXT_PUBLIC_PAKASIR_API_KEY=your_api_key
```

## Deployment Steps

### 1. Connect Repository

```bash
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables

Add the environment variables listed above in:
- Project Settings → Environment Variables

### 4. Deploy

Click "Deploy" and wait for build to complete.

## Post-Deployment

### 1. Run Database Migrations

Go to Supabase SQL Editor and run:

```sql
-- Run all migrations in order
-- 1. create_categories_table.sql
-- 2. add_barcode_to_products.sql
-- 3. create_payments_table.sql
-- 4. add_payment_fields_to_orders.sql
```

### 2. Update Pakasir URLs

In Admin → Settings → General:

```
Callback URL: https://your-app.vercel.app/api/payment/callback
Return URL: https://your-app.vercel.app/payment/success
```

Register these URLs in Pakasir Dashboard.

### 3. Create Admin User

```sql
-- In Supabase SQL Editor
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your_user_id';
```

## Vercel Configuration

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

### next.config.ts

- Image domains configured
- Serverless optimizations enabled
- React Compiler enabled

## Troubleshooting

### Build Errors

1. Check environment variables are set
2. Ensure all dependencies are in package.json
3. Check build logs in Vercel dashboard

### Runtime Errors

1. Check Vercel Function Logs
2. Verify Supabase connection
3. Check RLS policies are correct

### Payment Gateway Issues

1. Verify Pakasir credentials
2. Check callback URL is registered
3. Enable sandbox mode for testing

## Performance Optimization

- Images are optimized via Next.js Image
- API routes are serverless functions
- Static pages are cached at edge
- Database queries use indexes

## Monitoring

- Vercel Analytics: Built-in
- Error Tracking: Check Function Logs
- Database: Supabase Dashboard

## Scaling

Vercel automatically scales based on traffic:
- Serverless functions scale to zero
- Edge caching for static content
- Global CDN distribution

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
