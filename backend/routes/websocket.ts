import * as express from 'express';
const router = express.Router();

router.get('/', (req: any, res: any, next: any) => {
  res.send({ "websocket": true } );
});

module.exports = router;
