import { DataTypes, Sequelize } from 'sequelize'

const Color = (sequelize: Sequelize) =>
    sequelize.define(
        'Color',
        {
            color_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            }
        },
        {
            timestamps: true
        }
    )

export default Color
