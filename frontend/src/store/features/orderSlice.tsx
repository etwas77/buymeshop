import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { api, authApi } from "../../component/services/api";
import { OrderDto } from "../../dtos/OrderDto";

export const placeOrder = createAsyncThunk(
    "order/placeOrder",
    async (userId: number) => {
        try {
            const response = await authApi.post("/orders/order?userId=" + userId, {});
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
        try {
            const response = await authApi.get("/orders/user/" + userId);
            return response.data.data as OrderDto[];
        }
        catch (error: any) {
            toast.error("Error fetching orders: " + error.message);
            return undefined;
        }
    }
);

export const createPaymentIntent = createAsyncThunk(
    "order/createPaymentIntent",
    async (intent: {amount: number, currency: string}) => {
        const responce = await authApi.post("/orders/create-payment-intent", intent);
        return responce.data.data as string;
    }
);


export interface OrderState {
    orders: OrderDto[];
    isLoading: boolean;
    clientSecret?: string;
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
            .addCase(createPaymentIntent.fulfilled, (state, action) => {
                state.clientSecret = action.payload;
            })
            ;
    }
});

export const { } = orderSlice.actions;
export default orderSlice.reducer;