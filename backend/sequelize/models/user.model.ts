import { Sequelize, DataTypes, Model } from 'sequelize';

export class User extends Model {
    public id!: number;
    public username!: string;
};

export function initialize(sequelize: Sequelize) {
    return User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            username: {
                type: new DataTypes.STRING(128),
                allowNull: false,
            },
        },
        {
            tableName: "users",
            sequelize, // passing the `sequelize` instance is required
        }
    );
};

export default User;