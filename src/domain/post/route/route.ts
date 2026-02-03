import { Request, Response, Router } from 'express';
import { basicAuthMiddleware } from '../../../core/middlewares/basic-auth-middleware';
import { dtoValidationMiddleware } from '../../../core/middlewares/dto-validation-middleware';
import { DtoSchema } from '../schemas/dto.schema';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { PostsRepo } from '../../../repositories/posts.repo';

export const router = Router();

router.get('/', (_, res: Response) => {
  res.send(PostsRepo.getAll());
});

router.get('/:id', (req: Request, res: Response) => {
  const blog = PostsRepo.findByID(String(req.params.id));

  return blog ? res.send(blog) : res.sendStatus(HTTP_STATUS.NOT_FOUND);
});

router.post(
  '/',
  basicAuthMiddleware,
  dtoValidationMiddleware(DtoSchema),
  (req, res) => {
    return res.status(HTTP_STATUS.CREATED).send(PostsRepo.create(req.body));
  }
);

router.put(
  '/:id',
  basicAuthMiddleware,
  dtoValidationMiddleware(DtoSchema),
  (req, res) => {
    const replaced = PostsRepo.replace(String(req.params.id), req.body);

    return replaced
      ? res.sendStatus(HTTP_STATUS.NO_CONTENT)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  }
);

router.delete('/:id', basicAuthMiddleware, (req: Request, res: Response) => {
  const deleted = PostsRepo.remove(String(req.params.id));

  return deleted
    ? res.sendStatus(HTTP_STATUS.NO_CONTENT)
    : res.sendStatus(HTTP_STATUS.NOT_FOUND);
});
