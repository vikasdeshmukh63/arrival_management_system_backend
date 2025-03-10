import database from '../models/index'

interface Brand {
    getDataValue(key: 'name'): string
}

interface Category {
    getDataValue(key: 'name'): string
}

function padNumber(num: number, size: number): string {
    return num.toString().padStart(size, '0')
}

function calculateEAN13CheckDigit(digits: string): string {
    // EAN-13 check digit calculation
    let sum = 0
    for (let i = 0; i < 12; i++) {
        const digit = parseInt(digits[i])
        sum += digit * (i % 2 === 0 ? 1 : 3)
    }
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit.toString()
}

export async function generateTSKU(brandId: number, categoryId: number): Promise<string> {
    // Get the latest product count for this category
    const productCount = await database.Product.count({
        where: { category_id: categoryId }
    })

    // Get brand and category codes
    const brand = (await database.Brand.findByPk(brandId)) as Brand | null
    const category = (await database.Category.findByPk(categoryId)) as Category | null

    if (!brand || !category) {
        throw new Error('Brand or category not found')
    }

    // Generate brand code (first 3 letters uppercase)
    const brandCode = brand.getDataValue('name').substring(0, 3).toUpperCase()

    // Generate category code (first 2 letters uppercase)
    const categoryCode = category.getDataValue('name').substring(0, 2).toUpperCase()

    // Generate sequential number (padded to 6 digits)
    const sequentialNumber = padNumber(productCount + 1, 6)

    // Format: BRD-CAT-NNNNNN (e.g., NIK-SH-000001 for first Nike Shoe)
    return `${brandCode}-${categoryCode}-${sequentialNumber}`
}

export function generateBarcode(): string {
    // Get current timestamp for uniqueness (last 6 digits)
    const timestamp = Date.now().toString().slice(-6)

    // Generate random number for additional uniqueness (4 digits)
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')

    // Company prefix (first 2 digits - can be customized)
    const companyPrefix = '29'

    // Combine all parts without check digit
    const barcodeWithoutCheck = `${companyPrefix}${timestamp}${random}`

    // Calculate and append check digit
    const checkDigit = calculateEAN13CheckDigit(barcodeWithoutCheck)

    // Return complete EAN-13 barcode
    return `${barcodeWithoutCheck}${checkDigit}`
}

