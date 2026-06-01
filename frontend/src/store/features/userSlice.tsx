import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { UserDto } from "../../dtos/UserDto";
import { api } from "../../component/services/api";
import { toast } from "react-toastify";
import { CreateUserRequestDto } from "../../dtos/CreateUserRequestDto";
import { AddressDto } from "../../dtos/AddressDto";
import { logout } from "./authSlice";

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

export const updateAddress = createAsyncThunk(
    "user/updateAddress",
    async (payload: { addressId: string; address: AddressDto }) => {
        const { addressId, address } = payload;
        try {
            const response = await api.put("/addresses/" + addressId, address);
            toast.success("Address updated successfully");
            return response.data.data as AddressDto;
        }
        catch (error: any) {
            toast.error("Error updating address: " + error.message);
            return undefined;
        }
    }
);
export const deleteAddress = createAsyncThunk(
    "user/deleteAddress",
    async (payload: { addressId: string; }) => {
        try {
            await api.delete("/addresses/" + payload.addressId);
            toast.success("Address deleted successfully");
            return;
        }
        catch (error: any) {
            toast.error("Error deleting address: " + error.message);
            return;
        }
    }
);

export const createAddresses = createAsyncThunk(
    "user/createAddresses",
    async (payload: { addresses: AddressDto[]; }) => {
        try {
            const response = await api.post("/addresses", payload.addresses);
            toast.success("Addresses created successfully");
            return response.data.data as AddressDto[];
        }
        catch (error: any) {
            toast.error("Error creating addresses: " + error.message);
            return undefined;
        }
    }
);

export const updateUser = createAsyncThunk(
    "user/updateUser",
    async (user: UserDto) => {
        try {
            const body = {
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles.map(role => ({ name: role.name })),
            };
            const response = await api.put("/users/update/" + user.id, body);
            toast.success("User updated successfully");
            return response.data.data as UserDto;
        }
        catch (error: any) {
            toast.error("Error updating user: " + error.message);
            return undefined;
        }
    }
);

export interface UserState {
    users?: UserDto[];
    user?: UserDto;
    loading: boolean;
    error?: string;
}

const userSlice = createSlice({
    name: "user",
    initialState: {
        user: undefined,
        loading: false,
        error: undefined,
    } as UserState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
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
        builder.addCase(updateAddress.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload) {
                const updatedAddress = action.payload;
                if (state.user) {
                    const index = state.user.addresses?.findIndex(addr => addr.id === updatedAddress.id);
                    if (index !== undefined && index !== -1 && state.user.addresses) {
                        state.user.addresses[index] = updatedAddress;
                    }
                }
            }
        });
        builder.addCase(deleteAddress.fulfilled, (state, action) => {
            state.loading = false;
            const deletedAddressId = action.meta.arg.addressId;
            if (state.user && state.user.addresses) {
                state.user.addresses = state.user.addresses.filter(addr => addr.id !== deletedAddressId);
            }
        });
        builder.addCase(createAddresses.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload && state.user) {
                state.user.addresses = [...(state.user.addresses ?? []), ...action.payload];
            }
        });
        builder.addCase(updateUser.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload) {
                state.user = action.payload;
            }
        });
        builder.addCase(logout, (state) => {
            state.loading = false;
            state.error = undefined;
            state.user = undefined;
            state.users = undefined;
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

export const { setUser } = userSlice.actions;
export default userSlice.reducer;