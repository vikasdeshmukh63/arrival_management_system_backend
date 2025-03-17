import { DataTypes, Sequelize } from 'sequelize'

const Product = (sequelize: Sequelize) =>
    sequelize.define(
        'Product',
        {
            product_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            tsku: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },
            barcode: {
                type: DataTypes.STRING(100),
                unique: true
            },
            brand_id: DataTypes.INTEGER,
            category_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            size_id: DataTypes.INTEGER,
            color_id: DataTypes.INTEGER,
            style_id: DataTypes.INTEGER
        },
        {
            timestamps: true
        }
    )

export default Product
