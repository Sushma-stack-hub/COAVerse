const API_BASE = "http://localhost:3002";

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    message: string;
    token?: string;
    user: User;
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Registration failed");
    }

    return data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Login failed");
    }

    if (data.token) {
        localStorage.setItem("auth_token", data.token);
    }

    return data;
}

export async function getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem("auth_token");

    if (!token) {
        return null;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            localStorage.removeItem("auth_token");
            return null;
        }

        const data = await response.json();
        return data.user;
    } catch {
        localStorage.removeItem("auth_token");
        return null;
    }
}

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
}

export function logout(): void {
    localStorage.removeItem("auth_token");
}
