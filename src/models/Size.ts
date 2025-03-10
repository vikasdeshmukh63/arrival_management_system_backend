import { DataTypes, Sequelize } from 'sequelize'

const Size = (sequelize: Sequelize) => sequelize.define(
    'Size',
    {
        size_id: {
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

export default Size
