import { DataTypes, Sequelize } from 'sequelize'

const Brand = (sequelize: Sequelize) =>
    sequelize.define(
        'Brand',
        {
            brand_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true
            }
        },
        {
            timestamps: true
        }
    )

export default Brand
