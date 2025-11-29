// Duitku Payment Gateway Integration
// Documentation: https://docs.duitku.com/
// NOTE: This module should ONLY be used server-side (API routes, server components)

import crypto from 'crypto'

interface DuitkuConfig {
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
    customerEmail: string
    customerPhone?: string
    paymentMethod: string
    productDetails?: string
    expiryPeriod?: number
}

interface DuitkuResponse {
    success: boolean
    data?: {
        reference: string
        paymentUrl: string
        qrString?: string
        vaNumber?: string
        amount: string
    }
    message?: string
    statusCode?: string
}

class DuitkuAPI {
    private config: DuitkuConfig
    private baseUrl: string

    constructor(config: DuitkuConfig) {
        this.config = config
        this.baseUrl = config.isSandbox 
            ? 'https://sandbox.duitku.com/webapi/api'
            : 'https://passport.duitku.com/webapi/api'
        
        console.log('Duitku Client Initialized:', {
            merchantCode: config.merchantCode,
            isSandbox: config.isSandbox,
            baseUrl: this.baseUrl,
            hasApiKey: !!config.apiKey,
            hasCallbackUrl: !!config.callbackUrl,
            hasReturnUrl: !!config.returnUrl
        })
    }

    // Generate signature for request
    private generateSignature(merchantCode: string, merchantOrderId: string, paymentAmount: number, apiKey: string): string {
        const signatureString = `${merchantCode}${merchantOrderId}${paymentAmount}${apiKey}`
        return crypto.createHash('md5').update(signatureString).digest('hex')
    }

    // Verify callback signature
    verifyCallbackSignature(merchantCode: string, amount: string, merchantOrderId: string, apiKey: string): string {
        const signatureString = `${merchantCode}${amount}${merchantOrderId}${apiKey}`
        return crypto.createHash('md5').update(signatureString).digest('hex')
    }

    async createTransaction(params: CreateTransactionParams): Promise<DuitkuResponse> {
        try {
            const paymentAmount = Math.round(params.amount)
            const merchantOrderId = params.orderId
            const signature = this.generateSignature(
                this.config.merchantCode,
                merchantOrderId,
                paymentAmount,
                this.config.apiKey
            )

            const requestData = {
                merchantCode: this.config.merchantCode,
                paymentAmount: paymentAmount,
                paymentMethod: params.paymentMethod,
                merchantOrderId: merchantOrderId,
                productDetails: params.productDetails || 'Pembelian Produk',
                customerVaName: params.customerName,
                email: params.customerEmail,
                phoneNumber: params.customerPhone || '',
                callbackUrl: this.config.callbackUrl,
                returnUrl: this.config.returnUrl,
                signature: signature,
                expiryPeriod: params.expiryPeriod || 60 // default 60 minutes
            }

            console.log('Creating Duitku transaction:', {
                ...requestData,
                signature: '***hidden***'
            })

            const response = await fetch(`${this.baseUrl}/merchant/v2/inquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Duitku API HTTP Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                })
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const result = await response.json()
            console.log('Duitku response:', result)

            if (result.statusCode === '00') {
                return {
                    success: true,
                    data: {
                        reference: result.reference,
                        paymentUrl: result.paymentUrl,
                        qrString: result.qrString,
                        vaNumber: result.vaNumber,
                        amount: result.amount
                    },
                    statusCode: result.statusCode
                }
            } else {
                return {
                    success: false,
                    message: result.statusMessage || 'Transaction failed',
                    statusCode: result.statusCode
                }
            }
        } catch (error) {
            console.error('Duitku API Error:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                error: error
            })
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        }
    }

    async checkTransactionStatus(merchantOrderId: string): Promise<DuitkuResponse> {
        try {
            const signature = crypto
                .createHash('md5')
                .update(`${this.config.merchantCode}${merchantOrderId}${this.config.apiKey}`)
                .digest('hex')

            const response = await fetch(`${this.baseUrl}/merchant/transactionStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    merchantCode: this.config.merchantCode,
                    merchantOrderId: merchantOrderId,
                    signature: signature
                })
            })

            const result = await response.json()
            
            return {
                success: result.statusCode === '00',
                data: result,
                message: result.statusMessage,
                statusCode: result.statusCode
            }
        } catch (error) {
            console.error('Duitku Status Check Error:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            })
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        }
    }

    verifyCallback(callbackData: any, receivedSignature: string): boolean {
        try {
            const { merchantCode, amount, merchantOrderId } = callbackData
            const calculatedSignature = this.verifyCallbackSignature(
                merchantCode,
                amount,
                merchantOrderId,
                this.config.apiKey
            )
            
            console.log('Signature verification:', {
                received: receivedSignature,
                calculated: calculatedSignature,
                match: receivedSignature === calculatedSignature
            })

            return receivedSignature === calculatedSignature
        } catch (error) {
            console.error('Signature verification error:', error)
            return false
        }
    }

    // Get available payment methods
    async getPaymentMethods(amount: number): Promise<any> {
        try {
            const datetime = new Date().getTime()
            const signature = crypto
                .createHash('md5')
                .update(`${this.config.merchantCode}${amount}${datetime}${this.config.apiKey}`)
                .digest('hex')

            const response = await fetch(`${this.baseUrl}/merchant/paymentmethod/getpaymentmethod`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    merchantcode: this.config.merchantCode,
                    amount: amount,
                    datetime: datetime,
                    signature: signature
                })
            })

            const result = await response.json()
            return result
        } catch (error) {
            console.error('Get Payment Methods Error:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            })
            return { paymentFee: [] }
        }
    }
}

export const createDuitkuClient = (config: DuitkuConfig) => {
    return new DuitkuAPI(config)
}

export type { DuitkuConfig, CreateTransactionParams, DuitkuResponse }
