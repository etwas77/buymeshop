import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { LoginCredentials } from "../../component/auth/Login";
import { authApi } from "../../component/services/api";
import { clearAuthAndRedirect } from "../../component/common/utils/Functions";
import { AuthDto } from "../../dtos/AuthDto";

export const login = createAsyncThunk(
    "auth/login",
    async (credentials: LoginCredentials) => {
        const response = await authApi.post("/auth/login", credentials);
        return response.data as { accessToken: string };
    }
);

export const authMe = createAsyncThunk(
    "auth/authMe",
    async () => {
        const response = await authApi.get("/auth/me");
        return response.data as AuthDto;
    }
);


export interface AuthState {
    isAuthenticated?: boolean;
    token?: string;
    roles: string[];
    error?: string;
    authMe?: AuthDto;
}

const authSlice = createSlice({
    name: "auth",
    initialState: {
        isAuthenticated: !!localStorage.getItem("authToken"),
        token: localStorage.getItem("authToken") || undefined,
        roles: JSON.parse(localStorage.getItem("userRoles") || "[]"),
        error: undefined,
        authMe: undefined,
    } as AuthState,
    reducers: {
        logout(state) {
            state.isAuthenticated = false;
            state.token = undefined;
            state.roles = [];
            state.error = undefined;
            clearAuthAndRedirect();
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
        builder.addCase(authMe.fulfilled, (state, action) => {
            state.authMe = action.payload;
        });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

