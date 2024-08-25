import 'jsonwebtoken';

declare module 'jsonwebtoken' {
  interface VerifyOptions {
    user?: string;
    organisation?: string
  }

  interface JwtPayload{
    user?: string;
    organisation?: string
  }
}

declare module 'VerifyOptions' {
  interface VerifyOptions {
    user?: string;
    organisation?: string
  }

  interface JwtPayload{
    user?: string;
    organisation?: string
  }
}

