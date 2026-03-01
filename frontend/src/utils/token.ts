export const TOKEN_KEY = "banquet_access_token";
export const USER_KEY = "banquet_user";

export function getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function getAuthToken(): string | null {
    return getStoredToken();
}
