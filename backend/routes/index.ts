import * as express from 'express';
import User from '../sequelize/models/user.model';

const router = express.Router();

router.get('/', (req: any, res: any, next: any) => {
  res.send({ "running": true });
  User.create({ username: 'username' });
});

module.exports = router;
