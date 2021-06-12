import { Router, Request, Response } from 'express';
import { UserRepository } from '../sequelize/repositories';

const router = Router();

router.get('/', async (req: Request, res: Response, next: any) => {  
  res.send({ "running": true, user: await UserRepository.getUserById(7) });
});

module.exports = router;
