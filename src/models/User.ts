import bcrypt from 'bcrypt'
import { DataTypes, Sequelize } from 'sequelize'
import { EUserRole } from '../constants/application'

const User = (sequelize: Sequelize) =>
    sequelize.define(
        'User',
        {
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                set(value: string) {
                    this.setDataValue('password', bcrypt.hashSync(value, 10))
                }
            },
            role: {
                type: DataTypes.ENUM(EUserRole.ADMIN, EUserRole.USER),
                allowNull: false
            }
        },
        {
            timestamps: true
        }
    )

export default User
