import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../component/services/api";
import { CartDto } from "../../dtos/CartDto";
import { CartItemDto } from "../../dtos/CartItemDto";
import { LoginState } from "./loginSlice";

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async (payload: { productId: string; quantity: number }, { rejectWithValue, getState }) => {
        const state = getState() as { login: LoginState };
        const accessToken = state.login.accessToken ?? '';        
        try {
            const formData = new FormData();
            formData.append("productId", payload.productId);
            formData.append("quantity", payload.quantity.toString());

            const response = await api.post("/cartItems/add", formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            console.log('response', response);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Unknown error');
        }
    }
);

export const getUserCarts = createAsyncThunk(
    "cart/getUserCarts",
    async (payload: { userId: string; }, { rejectWithValue, getState }) => {
        const state = getState() as { login: LoginState };
        const accessToken = state.login.accessToken ?? '';
        try {
            const response = await api.get("/carts/user/" + payload.userId, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            console.log('response', response);

            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Unknown error');
        }
    }
);

export interface cartState {
    items: CartItemDto[];
    totalAmount: number;
    errorMessage?: string;
    successMessage?: string;
};

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        totalAmount: 0
    } as cartState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addToCart.fulfilled, (state, action) => {
                const data: CartDto = action.payload.data;
                state.items.push(...data.items);
                state.totalAmount += data.totalAmount;
                state.successMessage = action.payload.message;
                state.errorMessage = undefined; // Clear any previous error message on success
            })
            .addCase(addToCart.rejected, (state, action) => {
                // Prefer payload (backend message) if available, else fallback to error.message
                state.errorMessage = "Failed to add item to cart: " + (action.payload || action.error.message);
                state.successMessage = undefined; // Clear any previous success message on error
                
                console.log('action.error.message', action.error, 'action.payload', action.payload);
            })
            .addCase(getUserCarts.fulfilled, (state, action) => {
                const data: CartDto = action.payload.data;
                state.items = data.items;
                state.totalAmount = data.totalAmount;
                state.successMessage = action.payload.message;
                state.errorMessage = undefined; // Clear any previous error message on success
            })
            .addCase(getUserCarts.rejected, (state, action) => {
                state.errorMessage = "Failed to fetch user carts: " + (action.payload || action.error.message);
                state.successMessage = undefined; // Clear any previous success message on error
                
                console.log('action.error.message', action.error, 'action.payload', action.payload);
            });
    }
});

export default cartSlice.reducer;