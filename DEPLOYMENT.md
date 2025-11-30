# Deployment Guide - Vercel

## Prerequisites

- Vercel account
- Supabase project
- Duitku merchant account (optional for payment gateway)

## Environment Variables

Set these in **Vercel Dashboard → Project Settings → Environment Variables**:

**Required:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Optional (Duitku Payment Gateway):**
```bash
NEXT_PUBLIC_DUITKU_MERCHANT_CODE=your_merchant_code
NEXT_PUBLIC_DUITKU_API_KEY=your_api_key
NEXT_PUBLIC_DUITKU_SANDBOX=false
```

> **Note:** Payment gateway credentials can also be configured via Admin Panel → Settings → Payment after deployment.

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

**IMPORTANT:** In Vercel Dashboard:
1. Go to **Project Settings → Environment Variables**
2. Add each variable listed above
3. Select which environments (Production, Preview, Development)
4. Click **Save**

**Do not use Vercel Secrets** unless you specifically need them. Regular environment variables are sufficient.

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

### 2. Configure Payment Gateway (Optional)

If using Duitku:

1. **In Duitku Dashboard**, register these URLs:
   - Callback URL: `https://your-app.vercel.app/api/payment/callback`
   - Return URL: `https://your-app.vercel.app/payment/success`

2. **In Your App**, go to Admin → Settings → Payment and configure:
   - Merchant Code
   - API Key
   - Sandbox mode (disable for production)

### 3. Create Admin User

After your first user registration, promote them to admin:

```sql
-- In Supabase SQL Editor
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your_user_id';
```

You can find your user ID in the Supabase Dashboard under Authentication → Users.

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

1. Verify Duitku credentials in Admin → Settings
2. Check callback URL is registered in Duitku Dashboard
3. Enable sandbox mode for testing
4. Check API logs in Vercel Functions for detailed errors

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
