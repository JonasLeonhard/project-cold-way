import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response, next: any) => {  
  res.send({ "running": true });
});

module.exports = router;
