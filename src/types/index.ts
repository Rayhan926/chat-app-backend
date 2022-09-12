export type ErrorWithStatusCode = {
  statusCode: number;
} & Error;
export type CreateResponse = {
  data?: unknown;
  message: string;
};
export type UserSchemaType = {
  name: string;
  email: string;
  avatar?: string;
  username?: string;
};
