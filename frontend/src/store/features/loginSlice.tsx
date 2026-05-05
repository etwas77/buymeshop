import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
});

export const { setAccessToken } = loginSlice.actions;
export default loginSlice.reducer;