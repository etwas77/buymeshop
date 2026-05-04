import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../component/services/api";
import { CartDto } from "../../dtos/CartDto";
import { CartItemDto } from "../../dtos/CartItemDto";

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async (payload: { productId: string; quantity: number, accessToken: string }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("productId", payload.productId);
            formData.append("quantity", payload.quantity.toString());

            // const response = await fetch("http://localhost:9090/api/v1/cartItems/add", {
            //     method: "POST",
            //     headers: {
            //         Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiby5iYXJrZXJAbm93aGVyZS5jb20iLCJpZCI6Miwicm9sZXMiOltdLCJpYXQiOjE3Nzc4OTU5MjgsImV4cCI6MTc3NzkzMTkyOH0.zTmhJQ3e32DOwgFNYU1HTyJpy48N7DjI3hAu2RCanqc"
            //     },
            //     body: formData,
            //     credentials: "include"
            // });
            // const data = await response.json();
            // return data;

            const response = await api.post("/cartItems/add", formData, {
                headers: {
                    Authorization: `Bearer ${payload.accessToken}`
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
            })
            .addCase(addToCart.rejected, (state, action) => {
                // Prefer payload (backend message) if available, else fallback to error.message
                state.errorMessage = "Failed to add item to cart: " + (action.payload || action.error.message);
                console.log('action.error.message', action.error, 'action.payload', action.payload);
            })
    }
});

export default cartSlice.reducer;