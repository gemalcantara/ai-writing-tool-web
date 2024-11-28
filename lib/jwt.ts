import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_TOKEN || '476dfd9dd71de29c7c33b45c1ca69e1f1326bb0710e664a45de70f229389534e'; // Ensure this is set


export function signToken(payload: object): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' })
}

export function verifyToken(token: string): any {
  try {
   const decoded = jwt.verify(token, SECRET_KEY);     
    return decoded;
  } catch (error) {
    return null;
  }
}
export async function getAuthToken(): Promise<string | null> {
  // Get token from localStorage or cookie
  return localStorage.getItem('auth-token')
}