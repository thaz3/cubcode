export class AdminAuthError extends Error {
  readonly status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "AdminAuthError";
    this.status = status;
  }
}

/** Validates Bearer token against ADMIN_SECRET (must be set in env). */
export function assertAdminAuthorized(authHeader: string | null | undefined): void {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) {
    throw new AdminAuthError(
      "ADMIN_SECRET is not configured. Set it in your environment before using admin tools.",
      503,
    );
  }

  const expected = `Bearer ${secret}`;
  if (!authHeader || authHeader !== expected) {
    throw new AdminAuthError("Unauthorized admin request.", 401);
  }
}
