import { DataTypes, Sequelize } from 'sequelize'

const Category = (sequelize: Sequelize) => sequelize.define(
    'Category',
    {
        category_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        description: DataTypes.TEXT
    },
    {
        timestamps: true
    }
)

export default Category
