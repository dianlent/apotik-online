import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const reference = searchParams.get('reference')

        if (!reference) {
            return NextResponse.json(
                { error: 'Reference number is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Check order status by order_number (reference)
        const { data: order, error } = await supabase
            .from('orders')
            .select('payment_status, order_status, total_amount')
            .eq('order_number', reference)
            .single()

        if (error) {
            console.error('Error fetching order:', error)
            return NextResponse.json(
                { 
                    status: 'PENDING',
                    statusCode: '01',
                    message: 'Order not found or still pending'
                },
                { status: 200 }
            )
        }

        // Map payment status to Duitku-like response
        let status = 'PENDING'
        let statusCode = '01'

        if (order.payment_status === 'paid') {
            status = 'SUCCESS'
            statusCode = '00'
        } else if (order.payment_status === 'failed') {
            status = 'FAILED'
            statusCode = '02'
        } else if (order.payment_status === 'expired') {
            status = 'EXPIRED'
            statusCode = '03'
        }

        return NextResponse.json({
            status,
            statusCode,
            reference,
            amount: order.total_amount,
            paymentStatus: order.payment_status,
            orderStatus: order.order_status
        })

    } catch (error) {
        console.error('Error checking payment status:', error)
        return NextResponse.json(
            { 
                error: 'Internal server error',
                status: 'ERROR',
                statusCode: '99'
            },
            { status: 500 }
        )
    }
}
