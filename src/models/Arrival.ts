import { DataTypes, Sequelize } from 'sequelize'
import { EArrivalStatus } from '../constants/application'

const Arrival = (sequelize: Sequelize) =>
    sequelize.define(
        'Arrival',
        {
            arrival_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            arrival_number: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true
            },
            title: {
                type: DataTypes.STRING(200),
                allowNull: false
            },
            supplier_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            expected_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            started_date: DataTypes.DATE,
            finished_date: DataTypes.DATE,
            status: {
                type: DataTypes.STRING(20),
                defaultValue: EArrivalStatus.UPCOMING,
                validate: {
                    isIn: [[EArrivalStatus.UPCOMING, EArrivalStatus.IN_PROGRESS, EArrivalStatus.FINISHED, EArrivalStatus.COMPLETED_WITH_DISCREPANCY]]
                }
            },
            expected_pallets: DataTypes.INTEGER,
            expected_boxes: DataTypes.INTEGER,
            expected_kilograms: DataTypes.DECIMAL(10, 2),
            expected_pieces: DataTypes.INTEGER,
            received_pallets: DataTypes.INTEGER,
            received_boxes: DataTypes.INTEGER,
            received_kilograms: DataTypes.DECIMAL(10, 2),
            received_pieces: DataTypes.INTEGER,
            notes: DataTypes.TEXT
        },
        {
            timestamps: true
        }
    )

export default Arrival
