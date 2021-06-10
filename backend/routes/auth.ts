import * as express from 'express';

const router = express.Router();

router.get('/', (req: any, res: any, next: any) => {
  res.send({ "running": true });
});

router.get('/github', (req: any, res: any, next: any) => {
    res.send({ "guthub": true });
});

router.get('/github/callback', (req: any, res: any, next: any) => {
    res.send({ "/github/callback": true });
});
  
router.get('/logout', (req: any, res: any, next: any) => {
  res.send({ "logout": true });
});

module.exports = router;
