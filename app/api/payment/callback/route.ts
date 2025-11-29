import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createDuitkuClient } from '@/lib/duitku'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const signature = request.headers.get('X-Signature') || ''

        console.log('Duitku Webhook received:', body)

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

        // Create Duitku client for signature verification
        const duitku = createDuitkuClient({
            merchantCode: settings.duitkuMerchantCode || '',
            apiKey: settings.duitkuApiKey || '',
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
            isSandbox: settings.duitkuSandboxMode
        })

        // Verify signature
        const isValid = duitku.verifyCallback(body, signature)
        if (!isValid) {
            console.error('Invalid signature')
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            )
        }

        // Extract data from callback
        const {
            merchantOrderId,
            reference,
            resultCode,
            amount,
            paymentCode,
            merchantUserId
        } = body

        console.log('Payment callback:', {
            merchantOrderId,
            reference,
            resultCode,
            amount,
            paymentCode
        })

        // Update order status based on payment status
        // resultCode '00' means success in Duitku
        if (resultCode === '00') {
            // Find order by merchantOrderId and update status
            const { error: orderError } = await supabase
                .from('orders')
                .update({
                    status: 'paid',
                    payment_reference: reference,
                    payment_method: paymentCode,
                    updated_at: new Date().toISOString()
                })
                .eq('id', merchantOrderId)

            if (orderError) {
                console.error('Error updating order:', orderError)
            }

            // Create payment record
            const { error: paymentError } = await supabase
                .from('payments')
                .insert({
                    order_id: merchantOrderId,
                    reference: reference,
                    amount: parseFloat(amount),
                    payment_method: paymentCode,
                    status: 'success',
                    paid_at: new Date().toISOString(),
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
        message: 'Duitku Webhook Endpoint',
        url: '/api/payment/callback',
        method: 'POST'
    })
}
