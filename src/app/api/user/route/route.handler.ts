import { Request, Response } from 'express';
import { withTryCatch } from '../../../../core/lib/with-try-catch';
import { UserDTO } from '../../../../domain/user/schemas/user.schema';
import { usersService } from '../../../../domain/user/service/users.service';
import { usersQueryRepo } from '../../../../repositories/users/users.query-repo';
import { HTTP_STATUS } from '../../../../core/constants/http-statuses.constants';
import {
  buildFilter,
  buildQuery,
} from '../../../../core/lib/build-mongo-query';
import {
  WithFilterAndSortAndPagination,
  WithFilterAndSortAndPaginationSchema,
} from '../../../../domain/user/schemas/query-params.schema';
import { createWithPaginationResult } from '../../../../core/lib/create-with-paginatoin-result';

const getAll = withTryCatch(
  async (
    req: Request<unknown, unknown, unknown, WithFilterAndSortAndPagination>,
    res: Response
  ) => {
    const params = WithFilterAndSortAndPaginationSchema.parse(req.query);

    const users = await usersQueryRepo.findAll(
      buildQuery(
        params,
        buildFilter(
          [
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            ['accountData.login', params.searchLoginTerm],
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            ['accountData.email', params.searchEmailTerm],
          ],
          'or'
        )
      )
    );

    return res.send(
      createWithPaginationResult({
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        count: users.count,
        items: users.users,
      })
    );
  }
);

const create = withTryCatch(
  async (req: Request<unknown, unknown, UserDTO>, res: Response) => {
    const createResult = await usersService.create(req.body);

    const user = await usersQueryRepo.findByID(createResult.insertedId.toString());

    return res.status(HTTP_STATUS.CREATED).send(user);
  }
);

const remove = withTryCatch(
  async (req: Request<{ id: string }>, res: Response) => {
    await usersService.remove(req.params.id);

    return res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }
);

export const routeHandler = {
  getAll,
  create,
  remove,
};
