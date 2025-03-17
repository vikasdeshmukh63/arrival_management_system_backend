import database from '../models/index'

// brand type
interface Brand {
    getDataValue(key: 'name'): string
}

// category type
interface Category {
    getDataValue(key: 'name'): string
}

// pad number
function padNumber(num: number, size: number): string {
    return num.toString().padStart(size, '0')
}

// calculate ean 13 check digit
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

// generate tsku
export async function generateTSKU(brandId: number, categoryId: number): Promise<string> {
    // get the latest product count for this category
    const productCount = await database.Product.count({
        where: { category_id: categoryId }
    })

    // get brand and category codes
    const brand = (await database.Brand.findByPk(brandId)) as Brand | null
    const category = (await database.Category.findByPk(categoryId)) as Category | null

    if (!brand || !category) {
        throw new Error('Brand or category not found')
    }

    // generate brand code (first 3 letters uppercase)
    const brandCode = brand.getDataValue('name').substring(0, 3).toUpperCase()

    // generate category code (first 2 letters uppercase)
    const categoryCode = category.getDataValue('name').substring(0, 2).toUpperCase()

    // generate sequential number (padded to 6 digits)
    const sequentialNumber = padNumber(productCount + 1, 6)

    // format: BRD-CAT-NNNNNN (e.g., NIK-SH-000001 for first Nike Shoe)
    return `${brandCode}-${categoryCode}-${sequentialNumber}`
}

export function generateBarcode(): string {
    // get current timestamp for uniqueness (last 6 digits)
    const timestamp = Date.now().toString().slice(-6)

    // generate random number for additional uniqueness (4 digits)
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')

    // company prefix (first 2 digits - can be customized)
    const companyPrefix = '29'

    // combine all parts without check digit
    const barcodeWithoutCheck = `${companyPrefix}${timestamp}${random}`

    // calculate and append check digit
    const checkDigit = calculateEAN13CheckDigit(barcodeWithoutCheck)

    // return complete ean 13 barcode
    return `${barcodeWithoutCheck}${checkDigit}`
}
