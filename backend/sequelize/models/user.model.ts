import { Sequelize, DataTypes, Model } from 'sequelize';
export interface UserAttributes {
    id?: number;
    email: string;
    password: string;
    displayName: string;
    providerId: string;
    provider: string;
    businessName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
};
export class User extends Model<UserAttributes> implements UserAttributes {
    public id!: number;
    public email!: string;
    public password!: string;
    public displayName!: string;
    public providerId!: string;
    public provider!: string;
    public businessName!: string | null;
    public firstName!: string | null;
    public lastName!: string | null;
};

export function initialize(sequelize: Sequelize) {
    return User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            displayName: {
                type: new DataTypes.STRING(128),
                allowNull: false
            },
            providerId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            provider: {
                type: DataTypes.STRING,
                allowNull: false
            },
            businessName: {
                type: DataTypes.STRING,
                allowNull: true
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: true
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },
        {
            tableName: "users",
            sequelize, // passing the `sequelize` instance is required
        }
    );
};

export default User;