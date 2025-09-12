// src/api/auth.ts
export type UserDto = { id: string; username: string };

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function login(username: string, password: string) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: username, password }), // or { username, password } if your API expects that
  });

  if (!res.ok) {
    // 401 from backend for bad creds
    const msg = await safeMessage(res);
    throw new Error(msg || "Invalid credentials");
  }

  return (await res.json()) as { token: string };
}

export async function getMe(): Promise<UserDto> {
  const res = await fetch("/api/me", {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  });
  if (!res.ok) {
    const msg = await safeMessage(res);
    throw new Error(msg || "Unauthorized");
  }
  return (await res.json()) as UserDto;
}

async function safeMessage(res: Response) {
  try {
    const j = await res.json();
    return (j && (j.message || j.error)) as string | undefined;
  } catch {
    return undefined;
  }
}
