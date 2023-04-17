import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';

const getToken = (authToken: string): string => {
  console.log('auth token', authToken);
  const match = authToken.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
    throw new HttpException({ message: '' }, HttpStatus.UNAUTHORIZED);
  }
  return match[1];
};

const decodeToken = (tokenString: string) => {
  const decoded = verify(tokenString, 'secret');
  if (!decoded) {
    throw new HttpException(
      { message: 'INVALID_AUTH_TOKEN' },
      HttpStatus.UNAUTHORIZED,
    );
  }
  return decoded;
};
export const handleAuth = ({ req }) => {
  try {
    if (req.headers.authorization) {
      const token = getToken(req.headers.authorization);
      const decoded: any = decodeToken(token);
      return {
        userId: decoded.id,
      };
    }
  } catch (err) {
    throw new UnauthorizedException(
      'User unauthorized with invalid authorization Headers',
    );
  }
};
