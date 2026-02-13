import { Router } from 'express';
import { removeAllService } from '../services/testing.service';

export const router = Router();

router.delete('/all-data', removeAllService)