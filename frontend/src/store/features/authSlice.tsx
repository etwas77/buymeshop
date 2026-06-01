import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { LoginCredentials } from "../../component/auth/Login";
import { api } from "../../component/services/api";

export const login = createAsyncThunk(
    "auth/login",
    async (credentials: LoginCredentials) => {
        const response = await api.post("/auth/login", credentials);
        return response.data as { accessToken: string };
    }
);


export interface AuthState {
    isAuthenticated?: boolean;
    token?: string;
    roles: string[];
    error?: string;
}

const authSlice = createSlice({
    name: "auth",
    initialState: {
        isAuthenticated: !!localStorage.getItem("authToken"),
        token: localStorage.getItem("authToken") || undefined,
        roles: JSON.parse(localStorage.getItem("userRoles") || "[]"),
        error: undefined,
    } as AuthState,
    reducers: {
        logout(state) {
            state.isAuthenticated = false;
            state.token = undefined;
            state.roles = [];
            state.error = undefined;
            localStorage.removeItem("authToken");
            localStorage.removeItem("userId");
            localStorage.removeItem("userRoles");
        },
    },
    extraReducers: (builder) => {
        builder.addCase(login.fulfilled, (state, action) => {
            state.token = action.payload.accessToken;
            state.isAuthenticated = true;
            const decodedToken: any = jwtDecode(state.token);
            state.roles = decodedToken.roles || [];
            localStorage.setItem("authToken", state.token);
            localStorage.setItem("userRoles", JSON.stringify(state.roles));
            localStorage.setItem("userId", decodedToken.id);
        });
        builder.addCase(login.rejected, (state, action) => {
            state.error = action.error.message;
        });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

