import { DataTypes, Sequelize } from 'sequelize'

const Style = (sequelize: Sequelize) => sequelize.define(
    'Style',
    {
        style_id: {
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

export default Style
