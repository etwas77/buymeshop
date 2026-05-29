import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { UserDto } from "../../dtos/UserDto";
import { api } from "../../component/services/api";
import { toast } from "react-toastify";
import { CreateUserRequestDto } from "../../dtos/CreateUserRequestDto";
import { AddressDto } from "../../dtos/AddressDto";

export const getUserById = createAsyncThunk(
    "user/getUserById",
    async (userId: number) => {
        try {
            const response = await api.get("/users/user/" + userId);
            return response.data.data as UserDto;
        }
        catch (error: any) {
            toast.error("Error fetching user: " + error.message);
            return undefined;
        }   
    }
);
export const getUsers = createAsyncThunk(
    "user/getUsers",
    async () => {
        try {
            const response = await api.get("/users");
            return response.data.data as UserDto[];
        }
        catch (error: any) {
            toast.error("Error fetching user: " + error.message);
            return undefined;
        }   
    }
);
export const createUser = createAsyncThunk(
    "user/createUser",
    async (req: CreateUserRequestDto) => {
        try {
            const response = await api.post("/users/add", req);
            return response.data.data as UserDto;
        }
        catch (error: any) {
            toast.error("Error creating user: " + error.message);
            return undefined;
        }   
    }
);
export const deleteUser = createAsyncThunk(
    "user/deleteUser",
    async (userId: number) => {
        try {            
            await api.delete("/users/user/" + userId);
            toast.success("User deleted successfully");
        }
        catch (error: any) {
            toast.error("Error deleting user: " + error.message);
        }
    }
);

export interface UserState {
    users?: UserDto[];
    user?: UserDto;
    loading: boolean;
    error?: string;
    addresses?: AddressDto[];
}

const userSlice = createSlice({
    name: "user",
    initialState: {
        user: undefined,
        loading: false,
        error: undefined,
    } as UserState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(getUserById.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload) {
                state.user = action.payload;
            }
        });
        builder.addCase(getUsers.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload) {
                state.users = action.payload;
            }   
        });
        builder.addCase(createUser.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload) {
                state.user = action.payload;
            }
        }); 
        builder.addCase(deleteUser.fulfilled, (state) => {
            state.loading = false;
            state.user = undefined;
        });
        builder.addMatcher(
            (action) => action.type.startsWith("user/") && action.type.endsWith("/pending"),
            (state) => {
                state.loading = true;
                state.error = undefined;
            }
        );       
    },
});

export const {  } = userSlice.actions;
export default userSlice.reducer;