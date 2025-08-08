export function validateToken(req: Request | { headers: any }): boolean {
  const token = req.headers['authorization'] || req.headers['Authorization'];
  return token === `Bearer ${process.env.SECURITY_TOKEN}`;
}
