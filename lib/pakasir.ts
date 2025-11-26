// Pakasir Payment Gateway Integration
// Documentation: https://pakasir.com/p/docs
// Vercel-friendly implementation using Web Crypto API

interface PakasirConfig {
    merchantCode: string
    apiKey: string
    callbackUrl: string
    returnUrl: string
    isSandbox?: boolean
}

interface CreateTransactionParams {
    orderId: string
    amount: number
    customerName: string
    customerEmail?: string
    customerPhone?: string
    paymentMethod?: string
}

interface PakasirResponse {
    success: boolean
    data?: {
        payment_url: string
        qr_string?: string
        reference: string
        expired_at: string
    }
    message?: string
}

class PakasirAPI {
    private config: PakasirConfig
    private baseUrl: string

    constructor(config: PakasirConfig) {
        this.config = config
        this.baseUrl = config.isSandbox 
            ? 'https://sandbox.pakasir.com/api'
            : 'https://api.pakasir.com'
    }

    async createTransaction(params: CreateTransactionParams): Promise<PakasirResponse> {
        try {
            const requestData = {
                merchant_code: this.config.merchantCode,
                amount: params.amount,
                order_id: params.orderId,
                customer_name: params.customerName,
                customer_email: params.customerEmail || '',
                customer_phone: params.customerPhone || '',
                payment_method: params.paymentMethod || 'qris',
                return_url: this.config.returnUrl,
                callback_url: this.config.callbackUrl,
                expired_time: 3600 // 1 hour in seconds
            }

            console.log('Creating Pakasir transaction:', requestData)

            const response = await fetch(`${this.baseUrl}/v1/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify(requestData)
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const result = await response.json()
            console.log('Pakasir response:', result)
            
            return {
                success: result.status === 'success',
                data: result.data,
                message: result.message
            }
        } catch (error) {
            console.error('Pakasir API Error:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    async checkTransactionStatus(orderId: string): Promise<PakasirResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/v1/payment/status/${orderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const result = await response.json()
            return {
                success: result.status === 'success',
                data: result.data,
                message: result.message
            }
        } catch (error) {
            console.error('Pakasir Status Check Error:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    verifyCallback(callbackData: any, apiKey: string): boolean {
        // Verify that callback is from Pakasir
        // In production, implement proper signature verification
        return apiKey === this.config.apiKey
    }
}

export const createPakasirClient = (config: PakasirConfig) => {
    return new PakasirAPI(config)
}

export type { PakasirConfig, CreateTransactionParams, PakasirResponse }
