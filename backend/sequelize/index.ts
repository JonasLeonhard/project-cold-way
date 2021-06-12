import { Sequelize, Dialect } from 'sequelize';
import { Database } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * create a connection to the database using .env file variables or defaults:
 * - SEQUELIZE_DBNAME || 'postgres'
 * - SEQUELIZE_USERNAME || 'postgres'
 * - SEQUELIZE_PASSWORD || 'postgres'
 * - SEQUELIZE_HOST || 'localhost'
 * - SEQUELIZE_PORT || '5432'
 * - SEQUELIZE_DIALECT || 'postgres'
 * - SEQUELIZE_POOL_MAX || '5'
 * - SEQUELIZE_POOL_MIN || '0'
 * - SEQUELIZE_POOL_ACQUIRE || '10.000'
 * - SEQUELIZE_POOL_IDLE || '10.000'
 * - SEQUELIZE_LOGGING || 'false'
 * 
 * @use sequelizeInit().then(db => {...})
 * @return Promise<Database> | Promise containing Database object { sequelize: Sequelize, models: { [filename]: ModelClass }}
 */
const sequelizeInit = async (): Promise<Database> => {
    const dbName: string = process.env.SEQUELIZE_DBNAME || 'postgres';
    const dbUser: string = process.env.SEQUELIZE_USERNAME || 'postgres';
    const dbPassword: string = process.env.SEQUELIZE_PASSWORD || 'postgres';
    const dbHost: string = process.env.SEQUELIZE_HOST || 'localhost';
    const dbPort: string = process.env.SEQUELIZE_PORT || '5432';
    const dbDialect: Dialect = process.env.SEQUELIZE_DIALECT as Dialect || 'postgres' as Dialect;
    const dbPoolMax: string = process.env.SEQUELIZE_POOL_MAX || '5';
    const dbPoolMin: string = process.env.SEQUELIZE_POOL_MIN || '0';
    const dbPoolAcquire: string = process.env.SEQUELIZE_POOL_ACQUIRE || '30.000';
    const dbPoolIdle: string = process.env.SEQUELIZE_POOL_IDLE || '10.000';
    const dbLogging: string = process.env.SEQUELIZE_LOGGING || 'false';

    console.log('🐲 Sequelize - initialize: using .env');
    const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: +dbPort,
        dialect: dbDialect,
        logging: dbLogging == 'true',
        pool: {
            max: +dbPoolMax,
            min: +dbPoolMin,
            acquire: +dbPoolAcquire,
            idle: +dbPoolIdle
        }
    });

    const db: Database = {
        sequelize,
        models: {}
    }

    for (const filename of fs.readdirSync(path.join(__dirname, 'models'))) {
        if (!filename.includes('.map')) {
            const module = await import(`./models/${filename}`);
            db.models[filename.replace('.js', '')] = module.initialize(sequelize);
            console.log('🐲 Sequelize - initialize:', filename.replace('.js', ''))
        }
    }

    return db;
}

export default sequelizeInit;