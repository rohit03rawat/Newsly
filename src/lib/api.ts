export interface NewsArticle {
  id?: number;
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

type NewsResult =
  | NewsArticle[]
  | { status: "processing" | "failed"; message?: string };

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(
  /\/$/,
  "",
);
const ACCESS_TOKEN_KEY = "news_access_token";
const REFRESH_TOKEN_KEY = "news_refresh_token";
const USERNAME_KEY = "news_username";
const AUTH_CHANGE_EVENT = "news-auth-change";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getUsername = () => localStorage.getItem(USERNAME_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

const notifyAuthChange = () =>
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  notifyAuthChange();
};

const saveTokens = (tokens: AuthTokens, username: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  localStorage.setItem(USERNAME_KEY, username);
  notifyAuthChange();
};

const isAccessTokenExpired = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };
    return typeof decoded.exp !== "number" || decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const responseMessage = async (response: Response) => {
  const body = await response.json().catch(() => null);
  if (typeof body?.detail === "string") return body.detail;
  if (typeof body?.message === "string") return body.message;
  if (body && typeof body === "object") {
    const firstError = Object.values(body)
      .flat(2)
      .find((value) => typeof value === "string");
    if (typeof firstError === "string") return firstError;
  }
  return `Request failed (${response.status})`;
};

const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) {
    clearTokens();
    return null;
  }

  const tokens = (await response.json()) as {
    access: string;
    refresh?: string;
  };
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  if (typeof tokens.refresh === "string") {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  }
  notifyAuthChange();
  return tokens.access;
};

export const restoreSession = async () => {
  const access = getAccessToken();
  if (access && !isAccessTokenExpired(access)) return true;
  return Boolean(await refreshAccessToken());
};

export const revokeSession = async () => {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      await fetch(`${API_BASE_URL}/token/blacklist/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
    }
  } finally {
    clearTokens();
  }
};

const request = async <T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> => {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const access = getAccessToken();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (
    response.status === 401 &&
    access &&
    retry &&
    !path.startsWith("/token/")
  ) {
    const refreshedAccess = await refreshAccessToken();
    if (refreshedAccess) return request<T>(path, init, false);
    clearTokens();
  }
  if (!response.ok) throw new Error(await responseMessage(response));
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};

export const register = (details: {
  username: string;
  email: string;
  password: string;
}) =>
  request<{ message: string }>("/users/register/", {
    method: "POST",
    body: JSON.stringify(details),
  });

export const login = async (credentials: {
  username: string;
  password: string;
}) => {
  const tokens = await request<AuthTokens>("/token/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  saveTokens(tokens, credentials.username);
};

export const fetchLatestNews = () => request<NewsResult>("/news/latest/");

export const searchNews = (query: string) =>
  request<NewsResult>(`/news/search/?q=${encodeURIComponent(query)}`);

export const saveNews = (article: NewsArticle) =>
  request<NewsArticle>("/news/save/", {
    method: "POST",
    body: JSON.stringify(article),
  });

export const fetchSavedNews = () => request<NewsArticle[]>("/news/saved/");
