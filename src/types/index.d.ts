//local-guide-frontend-assignment\local-guide-backend\src\types\index.d.ts        

declare namespace Express {
  export interface Request {
    user?: {
      _id: string;
      role: string;
      email: string;
    };
  }
}
