import { DataTypes, Sequelize } from 'sequelize'

const Condition = (sequelize: Sequelize) =>
    sequelize.define(
        'Condition',
        {
            condition_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },
            description: DataTypes.TEXT
        },
        {
            timestamps: true
        }
    )

export default Condition
