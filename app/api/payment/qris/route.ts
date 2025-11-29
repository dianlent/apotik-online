import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createDuitkuClient } from '@/lib/duitku'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderId, amount, customerName, customerEmail, productDetails } = body

        // Validate required fields
        if (!orderId || !amount || !customerEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get Duitku settings from database
        const supabase = await createClient()
        const { data: settingsData } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'general')
            .single()

        if (!settingsData) {
            return NextResponse.json(
                { error: 'Settings not found' },
                { status: 500 }
            )
        }

        const settings = settingsData.value as any

        // Check if Duitku is configured
        if (!settings.duitkuMerchantCode || !settings.duitkuApiKey) {
            return NextResponse.json(
                { error: 'Duitku not configured. Please set up in Settings → General' },
                { status: 400 }
            )
        }

        if (!settings.duitkuCallbackUrl || !settings.duitkuReturnUrl) {
            return NextResponse.json(
                { error: 'Callback and Return URLs not configured' },
                { status: 400 }
            )
        }

        // Create Duitku client
        const duitku = createDuitkuClient({
            merchantCode: settings.duitkuMerchantCode,
            apiKey: settings.duitkuApiKey,
            callbackUrl: settings.duitkuCallbackUrl,
            returnUrl: settings.duitkuReturnUrl,
            isSandbox: settings.duitkuSandboxMode
        })

        // Create transaction with Duitku
        const result = await duitku.createTransaction({
            orderId,
            amount: Math.round(amount),
            customerName: customerName || 'Customer',
            customerEmail,
            paymentMethod: 'SP', // SP = QRIS for Duitku
            productDetails: productDetails || 'Purchase'
        })

        if (result.success && result.data) {
            return NextResponse.json({
                success: true,
                data: {
                    qr_string: result.data.qrString || '',
                    checkout_url: result.data.paymentUrl,
                    reference: result.data.reference,
                    amount: result.data.amount
                }
            })
        } else {
            return NextResponse.json(
                { 
                    success: false,
                    error: result.message || 'Failed to create QRIS',
                    statusCode: result.statusCode
                },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error('QRIS generation error:', error)
        return NextResponse.json(
            { 
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            },
            { status: 500 }
        )
    }
}
