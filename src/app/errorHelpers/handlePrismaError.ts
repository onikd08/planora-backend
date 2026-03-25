import { Prisma } from '../../generated/prisma/client';
import { IErrorSources } from '../interfaces/error';

const handlePrismaError = (
  err: Prisma.PrismaClientValidationError | Prisma.PrismaClientKnownRequestError
) => {
  let errorSources: IErrorSources[] = [
    {
      path: '',
      message: 'Prisma Formatting Error',
    },
  ];
  let statusCode = 400;
  let message = 'Prisma Error';

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Duplicate Entry';
      const metaTarget = err.meta?.target as string[];
      errorSources = [
        {
          path: metaTarget ? metaTarget.join(', ') : '',
          message: `${message}`,
        },
      ];
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record Not Found';
      errorSources = [
        {
          path: '',
          message: err.meta?.cause as string || message,
        },
      ];
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handlePrismaError;
