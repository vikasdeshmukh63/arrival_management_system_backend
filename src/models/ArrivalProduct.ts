import { DataTypes, Sequelize } from 'sequelize'

const ArrivalProduct = (sequelize: Sequelize) =>
    sequelize.define(
        'ArrivalProduct',
        {
            arrival_product_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            arrival_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            condition_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            expected_quantity: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                validate: {
                    min: 0
                }
            },
            received_quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 1
                }
            }
        },
        {
            timestamps: true
        }
    )

export default ArrivalProduct
