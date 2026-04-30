import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../component/services/api";
import { CartDto } from "../../dtos/CartDto";
import { CartItemDto } from "../../dtos/CartItemDto";

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async (payload: { productId: string; quantity: number }) => {
        console.log('payload', payload);
        const formData = new FormData();
        formData.append("productId", payload.productId);
        formData.append("quantity", payload.quantity.toString());
        console.log('formData', formData);
        const response = await api.post("/cartItems/add", formData, 
            {
                headers: {
                    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiby5iYXJrZXJAbm93aGVyZS5jb20iLCJpZCI6Miwicm9sZXMiOltdLCJpYXQiOjE3Nzc1NjE3NzksImV4cCI6MTc3NzU2MTg5OX0.ib-LDvnSdikJoFoXUO6ThdC4rOn1f29jb1m8Yifen9s"
                },
                withCredentials: true
            }
        );
        console.log('response', response);
        return response.data;
    }
);

export interface cartState {
    items: CartItemDto[];
    totalAmount: number;
    errorMessage?: string;
    successMessage?: string;
};

const cartSlide = createSlice({
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
                state.errorMessage = "Failed to add item to cart: " + action.error.message;                
                console.log('action.error.message', action.error);
            })
    }
});

export default cartSlide.reducer;