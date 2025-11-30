import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        // Get the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get order data from request
        const orderData = await request.json()
        
        // Validate required fields
        if (!orderData.orderId || !orderData.items || !orderData.total) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .single()

        // Get N8N webhook URL from environment
        const webhookUrl = process.env.NEXT_PUBLIC_N8N_ORDER_WEBHOOK_URL

        if (!webhookUrl) {
            console.warn('N8N Order Webhook URL not configured')
            return NextResponse.json(
                { success: true, message: 'Order processed (webhook not configured)' },
                { status: 200 }
            )
        }

        // Prepare webhook payload
        const webhookPayload = {
            orderId: orderData.orderId,
            orderNumber: orderData.orderNumber || orderData.orderId,
            customer: {
                id: user.id,
                name: profile?.full_name || orderData.customerName || 'Customer',
                email: profile?.email || user.email || orderData.customerEmail,
                phone: orderData.customerPhone || 'N/A'
            },
            items: orderData.items.map((item: any) => ({
                productId: item.id || item.product_id,
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            })),
            pricing: {
                subtotal: orderData.subtotal || orderData.total,
                discount: orderData.discount || 0,
                tax: orderData.tax || 0,
                shippingCost: orderData.shippingCost || orderData.shipping_cost || 0,
                total: orderData.total
            },
            shipping: {
                address: orderData.shippingAddress || 'N/A',
                method: orderData.shippingMethod || 'Standard',
                notes: orderData.notes || ''
            },
            payment: {
                method: orderData.paymentMethod || 'pending',
                status: orderData.paymentStatus || 'pending',
                reference: orderData.paymentReference || null
            },
            status: orderData.status || 'pending',
            timestamp: new Date().toISOString(),
            source: 'Apotik POS Online Order',
            metadata: {
                userAgent: request.headers.get('user-agent') || 'Unknown',
                ipAddress: request.headers.get('x-forwarded-for') || 
                          request.headers.get('x-real-ip') || 
                          'Unknown'
            }
        }

        // Send to N8N webhook
        const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload)
        })

        if (!webhookResponse.ok) {
            console.error('N8N webhook failed:', webhookResponse.status, await webhookResponse.text())
            // Don't fail the order, just log the error
            return NextResponse.json(
                { 
                    success: true, 
                    message: 'Order processed (webhook notification failed)',
                    webhookError: true
                },
                { status: 200 }
            )
        }

        const webhookResult = await webhookResponse.json().catch(() => ({}))

        return NextResponse.json(
            { 
                success: true, 
                message: 'Order processed and sent to N8N',
                webhookResponse: webhookResult
            },
            { status: 200 }
        )

    } catch (error) {
        console.error('Error processing order webhook:', error)
        return NextResponse.json(
            { 
                success: false, 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
