export interface JwtPayload {
  id: string;
  email: string;
  consultationId?: string; // Make this optional as it won't be present for all requests
}