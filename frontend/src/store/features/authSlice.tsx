import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LoginCredentials } from "../../component/auth/Login";
import { clearAuthAndRedirect } from "../../component/common/utils/Functions";
import { authApi } from "../../component/services/api";
import { AuthDto } from "../../dtos/AuthDto";

export const login = createAsyncThunk(
    "auth/login",
    async (credentials: LoginCredentials) => {
        const response = await authApi.post("/auth/login", credentials);
        console.log('login response', response.data.data);
        
        return response.data.data as AuthDto;
    }
);

export const callAuthMe = createAsyncThunk(
    "auth/callAuthMe",
    async () => {
        const response = await authApi.get("/auth/me");
        console.log('callAuthMe response', response.data.data);
        return response.data.data as AuthDto;
    }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async () => {
        const res = await authApi.post("/auth/logout");
        return res.data;
    }
);


export interface AuthState {
    error?: string;
    authMe?: AuthDto;
}

const authSlice = createSlice({
    name: "auth",
    initialState: {
        isAuthenticated: false,
        error: undefined,
        authMe: undefined,
    } as AuthState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(login.fulfilled, (state, action) => {
            state.authMe = action.payload;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.error = action.error.message;
             state.authMe = undefined;
        });
        builder.addCase(callAuthMe.fulfilled, (state, action) => {
            state.authMe = action.payload;
        });
        builder.addCase(callAuthMe.rejected, (state, action) => {
            state.error = action.error.message;
            state.authMe = undefined;
        });
        builder.addCase(logout.fulfilled, (state, _action) => {
            state.error = undefined;
            state.authMe = undefined;
            clearAuthAndRedirect();
        });
    }
});

export const { } = authSlice.actions;
export default authSlice.reducer;

