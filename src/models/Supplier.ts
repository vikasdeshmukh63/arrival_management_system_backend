import { DataTypes, Sequelize } from 'sequelize'

const Supplier = (sequelize: Sequelize) =>
    sequelize.define(
        'Supplier',
        {
            supplier_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            contact_person: DataTypes.STRING(100),
            phone: DataTypes.STRING(20),
            email: DataTypes.STRING(100),
            address: DataTypes.TEXT
        },
        {
            timestamps: true
        }
    )

export default Supplier
