import { logger } from '../../utils/logger'
import db from '../index'
import { IBrand, ICategory, ISize, IColor, IStyle, ICondition, ISupplier, IProduct, IArrival, IArrivalProduct } from '../types'

async function seedDatabase() {
    try {
        // Create Brands
        const brands = (await db.Brand.bulkCreate([
            { name: 'Nike' },
            { name: 'Adidas' },
            { name: 'Puma' },
            { name: 'Under Armour' },
            { name: 'New Balance' }
        ])) as unknown as IBrand[]

        // Create Categories
        const categories = (await db.Category.bulkCreate([
            { name: 'Shoes', description: 'All types of footwear' },
            { name: 'T-Shirts', description: 'Casual and sports t-shirts' },
            { name: 'Pants', description: 'Trousers and shorts' },
            { name: 'Jackets', description: 'Outerwear and coats' },
            { name: 'Accessories', description: 'Socks, caps, and other accessories' }
        ])) as unknown as ICategory[]

        // Create Sizes
        const sizes = (await db.Size.bulkCreate([
            { name: 'XS' },
            { name: 'S' },
            { name: 'M' },
            { name: 'L' },
            { name: 'XL' },
            { name: '38' },
            { name: '40' },
            { name: '42' },
            { name: '44' }
        ])) as unknown as ISize[]

        // Create Colors
        const colors = (await db.Color.bulkCreate([
            { name: 'Black' },
            { name: 'White' },
            { name: 'Red' },
            { name: 'Blue' },
            { name: 'Grey' }
        ])) as unknown as IColor[]

        // Create Styles
        const styles = (await db.Style.bulkCreate([
            { name: 'Casual' },
            { name: 'Sport' },
            { name: 'Formal' },
            { name: 'Running' },
            { name: 'Training' }
        ])) as unknown as IStyle[]

        // Create Conditions
        const conditions = (await db.Condition.bulkCreate([
            { name: 'New', description: 'Brand new with tags' },
            { name: 'Like New', description: 'Used but in excellent condition' },
            { name: 'Good', description: 'Used with minor signs of wear' },
            { name: 'Fair', description: 'Used with visible signs of wear' }
        ])) as unknown as ICondition[]

        // Create Suppliers
        const suppliers = (await db.Supplier.bulkCreate([
            {
                name: 'SportsDirect Ltd',
                contact_person: 'John Smith',
                phone: '+44 20 1234 5678',
                email: 'john.smith@sportsdirect.com',
                address: '123 Supply Street, London, UK'
            },
            {
                name: 'Global Athletics Supply',
                contact_person: 'Sarah Johnson',
                phone: '+1 555 123 4567',
                email: 'sarah.j@globalsupply.com',
                address: '456 Warehouse Ave, New York, USA'
            }
        ])) as unknown as ISupplier[]

        // Create Products
        const products = (await db.Product.bulkCreate([
            {
                name: 'Nike Air Zoom Runner',
                tsku: 'NK-RUN-001',
                barcode: '1234567890123',
                brand_id: brands[0].brand_id, // Nike
                category_id: categories[0].category_id, // Shoes
                size_id: sizes[6].size_id, // 40
                color_id: colors[0].color_id, // Black
                style_id: styles[3].style_id // Running
            },
            {
                name: 'Adidas Sport Tee',
                tsku: 'AD-TEE-001',
                barcode: '1234567890124',
                brand_id: brands[1].brand_id, // Adidas
                category_id: categories[1].category_id, // T-Shirts
                size_id: sizes[2].size_id, // M
                color_id: colors[1].color_id, // White
                style_id: styles[1].style_id // Sport
            },
            {
                name: 'Puma Training Pants',
                tsku: 'PM-PNT-001',
                barcode: '1234567890125',
                brand_id: brands[2].brand_id, // Puma
                category_id: categories[2].category_id, // Pants
                size_id: sizes[3].size_id, // L
                color_id: colors[4].color_id, // Grey
                style_id: styles[4].style_id // Training
            },
            {
                name: 'Under Armour Winter Jacket',
                tsku: 'UA-JKT-001',
                barcode: '1234567890126',
                brand_id: brands[3].brand_id, // Under Armour
                category_id: categories[3].category_id, // Jackets
                size_id: sizes[2].size_id, // M
                color_id: colors[2].color_id, // Red
                style_id: styles[0].style_id // Casual
            },
            {
                name: 'New Balance Running Socks',
                tsku: 'NB-ACC-001',
                barcode: '1234567890127',
                brand_id: brands[4].brand_id, // New Balance
                category_id: categories[4].category_id, // Accessories
                size_id: sizes[1].size_id, // S
                color_id: colors[1].color_id, // White
                style_id: styles[3].style_id // Running
            },
            {
                name: 'Nike Pro Training Shirt',
                tsku: 'NK-TEE-001',
                barcode: '1234567890128',
                brand_id: brands[0].brand_id, // Nike
                category_id: categories[1].category_id, // T-Shirts
                size_id: sizes[4].size_id, // XL
                color_id: colors[3].color_id, // Blue
                style_id: styles[4].style_id // Training
            },
            {
                name: 'Adidas Formal Shoes',
                tsku: 'AD-SHO-001',
                barcode: '1234567890129',
                brand_id: brands[1].brand_id, // Adidas
                category_id: categories[0].category_id, // Shoes
                size_id: sizes[7].size_id, // 42
                color_id: colors[0].color_id, // Black
                style_id: styles[2].style_id // Formal
            },
            {
                name: 'Puma Sports Cap',
                tsku: 'PM-ACC-001',
                barcode: '1234567890130',
                brand_id: brands[2].brand_id, // Puma
                category_id: categories[4].category_id, // Accessories
                size_id: sizes[0].size_id, // XS
                color_id: colors[2].color_id, // Red
                style_id: styles[1].style_id // Sport
            }
        ])) as unknown as IProduct[]

        // Create Arrivals
        const arrivals = (await db.Arrival.bulkCreate([
            {
                arrival_number: 'ARR-2024-001',
                title: 'Spring Collection 2024',
                supplier_id: suppliers[0].supplier_id,
                expected_date: new Date('2024-03-25'),
                status: 'upcoming',
                expected_pallets: 2,
                expected_boxes: 40,
                expected_pieces: 1000,
                notes: 'Spring collection including new Nike and Adidas items'
            },
            {
                arrival_number: 'ARR-2024-002',
                title: 'Summer Stock',
                supplier_id: suppliers[1].supplier_id,
                expected_date: new Date('2024-04-15'),
                status: 'upcoming',
                expected_pallets: 3,
                expected_boxes: 60,
                expected_pieces: 1500,
                notes: 'Summer collection focus on sportswear'
            },
            {
                arrival_number: 'ARR-2024-003',
                title: 'Fall Collection 2024',
                supplier_id: suppliers[0].supplier_id,
                expected_date: new Date('2024-08-10'),
                status: 'planned',
                expected_pallets: 4,
                expected_boxes: 80,
                expected_pieces: 2000,
                notes: 'Fall collection with focus on jackets and accessories'
            }
        ])) as unknown as IArrival[]

        // Create ArrivalProducts
        ;(await db.ArrivalProduct.bulkCreate([
            {
                arrival_id: arrivals[0].arrival_id,
                product_id: products[0].product_id,
                condition_id: conditions[0].condition_id, // New
                expected_quantity: 200,
                received_quantity: 0
            },
            {
                arrival_id: arrivals[0].arrival_id,
                product_id: products[1].product_id,
                condition_id: conditions[0].condition_id, // New
                expected_quantity: 300,
                received_quantity: 0
            },
            {
                arrival_id: arrivals[1].arrival_id,
                product_id: products[2].product_id,
                condition_id: conditions[0].condition_id, // New
                expected_quantity: 250,
                received_quantity: 0
            },
            {
                arrival_id: arrivals[1].arrival_id,
                product_id: products[3].product_id,
                condition_id: conditions[1].condition_id, // Like New
                expected_quantity: 150,
                received_quantity: 0
            },
            {
                arrival_id: arrivals[2].arrival_id,
                product_id: products[4].product_id,
                condition_id: conditions[0].condition_id, // New
                expected_quantity: 500,
                received_quantity: 0
            },
            {
                arrival_id: arrivals[2].arrival_id,
                product_id: products[5].product_id,
                condition_id: conditions[0].condition_id, // New
                expected_quantity: 400,
                received_quantity: 0
            },
            {
                arrival_id: arrivals[2].arrival_id,
                product_id: products[6].product_id,
                condition_id: conditions[2].condition_id, // Good
                expected_quantity: 300,
                received_quantity: 0
            }
        ])) as unknown as IArrivalProduct[]

        logger.success('Database seeded successfully!')
    } catch (error) {
        logger.error('Error seeding database:', error)
        throw error
    }
}

// Function to clear all data
async function clearDatabase() {
    try {
        await db.ArrivalProduct.destroy({ where: {} })
        await db.Arrival.destroy({ where: {} })
        await db.Product.destroy({ where: {} })
        await db.Brand.destroy({ where: {} })
        await db.Category.destroy({ where: {} })
        await db.Size.destroy({ where: {} })
        await db.Color.destroy({ where: {} })
        await db.Style.destroy({ where: {} })
        await db.Condition.destroy({ where: {} })
        await db.Supplier.destroy({ where: {} })

        logger.success('Database cleared successfully!')
    } catch (error) {
        logger.error('Error clearing database:', error)
        throw error
    }
}

// Export the functions
export { seedDatabase, clearDatabase }
