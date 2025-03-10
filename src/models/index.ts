import sequelize from './db/db'

// Import all models
import Arrival from './Arrival'
import ArrivalProduct from './ArrivalProduct'
import Brand from './Brand'
import Category from './Category'
import Color from './Color'
import Condition from './Condition'
import Product from './Product'
import Size from './Size'
import Style from './Style'
import Supplier from './Supplier'

// Initialize models with sequelize instance
const db = {
    Supplier: Supplier(sequelize),
    Arrival: Arrival(sequelize),
    Product: Product(sequelize),
    Brand: Brand(sequelize),
    Category: Category(sequelize),
    Size: Size(sequelize),
    Color: Color(sequelize),
    Style: Style(sequelize),
    ArrivalProduct: ArrivalProduct(sequelize),
    Condition: Condition(sequelize),
    sequelize
}

// Define associations here after all models are loaded
db.Supplier.hasMany(db.Arrival, { foreignKey: 'supplier_id' })
db.Arrival.belongsTo(db.Supplier, { foreignKey: 'supplier_id' })

db.Product.belongsTo(db.Brand, { foreignKey: 'brand_id' })
db.Product.belongsTo(db.Category, { foreignKey: 'category_id' })
db.Product.belongsTo(db.Size, { foreignKey: 'size_id' })
db.Product.belongsTo(db.Color, { foreignKey: 'color_id' })
db.Product.belongsTo(db.Style, { foreignKey: 'style_id' })

db.Arrival.belongsToMany(db.Product, { through: db.ArrivalProduct, foreignKey: 'arrival_id' })
db.Product.belongsToMany(db.Arrival, { through: db.ArrivalProduct, foreignKey: 'product_id' })

db.ArrivalProduct.belongsTo(db.Condition, { foreignKey: 'condition_id' })
db.ArrivalProduct.belongsTo(db.Arrival, { foreignKey: 'arrival_id' })
db.ArrivalProduct.belongsTo(db.Product, { foreignKey: 'product_id' })

export default db
