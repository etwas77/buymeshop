import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { api } from "../../component/services/api";
import { OrderDto } from "../../dtos/OrderDto";

export const placeOrder = createAsyncThunk(
    "order/placeOrder",
    async (userId: number) => {
        const accessToken = localStorage.getItem("authToken") ?? '';
        try {
            const response = await api.post("/orders/order?userId=" + userId, {}, {
                headers: { Authorization: `Bearer ${accessToken}` },
                withCredentials: true
            });
            return response.data.data as OrderDto;
        }
        catch (error: any) {
            toast.error("Error placing order: " + error.message);
            return undefined;
        }
    }
);

export const getOrdersByUserId = createAsyncThunk(
    "order/getOrdersByUserId",
    async (userId: number) => {
        const accessToken = localStorage.getItem("authToken") ?? '';
        try {
            const response = await api.get("/orders/user/" + userId, {
                headers: { Authorization: `Bearer ${accessToken}` },
                withCredentials: true
            });
            return response.data.data as OrderDto[];
        }
        catch (error: any) {
            toast.error("Error fetching orders: " + error.message);
            return undefined;
        }
    }
);


export interface OrderState {
    orders: OrderDto[];
    isLoading: boolean;
}

const orderSlice = createSlice({
    name: "order",
    initialState: {
        orders: [],
        isLoading: true
    } as OrderState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(placeOrder.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action.payload) {
                state.orders.push(action.payload);
            }
        })
            .addCase(placeOrder.rejected, (state) => {
                state.isLoading = false;
            })
            .addCase(getOrdersByUserId.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload) {
                    state.orders = action.payload;
                }
            })
            .addCase(getOrdersByUserId.rejected, (state) => {
                state.isLoading = false;
            })
            ;
    }
});

export const { } = orderSlice.actions;
export default orderSlice.reducer;