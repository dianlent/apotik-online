import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPakasirClient } from '@/lib/pakasir'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const signature = request.headers.get('X-Signature') || ''

        console.log('Pakasir Webhook received:', body)

        // Get Pakasir settings from database
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

        // Create Pakasir client for signature verification
        const pakasir = createPakasirClient({
            merchantId: settings.pakasirMerchantId,
            apiKey: settings.pakasirApiKey,
            secretKey: settings.pakasirSecretKey,
            isSandbox: settings.pakasirSandboxMode
        })

        // Verify signature
        const isValid = pakasir.verifyCallback(body, signature)
        if (!isValid) {
            console.error('Invalid signature')
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            )
        }

        // Extract data from callback
        const {
            order_id,
            reference,
            status,
            amount,
            payment_method,
            paid_at
        } = body

        console.log('Payment callback:', {
            order_id,
            reference,
            status,
            amount,
            payment_method
        })

        // Update order status based on payment status
        if (status === 'success' || status === 'paid') {
            // Find order by order_id (you may need to store this in your orders table)
            // For now, we'll create a payment record
            const { error: paymentError } = await supabase
                .from('payments')
                .insert({
                    order_id: order_id,
                    reference: reference,
                    amount: amount,
                    payment_method: payment_method,
                    status: 'success',
                    paid_at: paid_at,
                    callback_data: body
                })

            if (paymentError) {
                console.error('Error saving payment:', paymentError)
                return NextResponse.json(
                    { error: 'Failed to save payment' },
                    { status: 500 }
                )
            }

            console.log('Payment recorded successfully')
        }

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'Callback processed'
        })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Handle GET request (for testing)
export async function GET() {
    return NextResponse.json({
        message: 'Pakasir Webhook Endpoint',
        url: '/api/payment/callback',
        method: 'POST'
    })
}
