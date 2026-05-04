import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../component/services/api";


export const userLogin = createAsyncThunk(
    "auth/login",
    async (payload: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/login", payload);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Unknown error');
        }
    }
);

export interface LoginState {
    accessToken?: string;
}

const loginSlice = createSlice({
    name: "login",
    initialState: {accessToken: undefined} as LoginState,
    reducers: {
        setAccessToken: (state: LoginState, action: PayloadAction<string | undefined>) => {
            state.accessToken = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(userLogin.fulfilled, (state, action) => {
            state.accessToken = action.payload.accessToken;
        }); 
    },
});

export const { setAccessToken } = loginSlice.actions;
export default loginSlice.reducer;