import { Sequelize } from 'sequelize';

export type Database = {
    sequelize: Sequelize,
    models: {
        [filename: string]: any
    }
};