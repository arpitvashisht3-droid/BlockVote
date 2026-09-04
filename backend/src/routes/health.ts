import { Router, Request, Response } from 'express';

const router = Router();

const healthCheckHandler = (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'BlockVote Backend'
  });
};

router.get('/', healthCheckHandler);
router.get('/health', healthCheckHandler);

export default router;
