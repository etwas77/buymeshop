import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../component/services/api";
import { CartDto } from "../../dtos/CartDto";
import { CartItemDto } from "../../dtos/CartItemDto";

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async (payload: { productId: string; quantity: number }, { rejectWithValue }) => {
        const accessToken = localStorage.getItem("authToken") ?? '';
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
    async (payload: { userId: string; }, { rejectWithValue }) => {
        const accessToken = localStorage.getItem("authToken") ?? '';
        try {
            const response = await api.get("/carts/user/" + payload.userId, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Unknown error');
        }
    }
);



export const updateCartItemQuantity = createAsyncThunk(
    "cart/updateCartItemQuantity",
    async (payload: { cartId: number; productId: number; quantity: number }, { rejectWithValue }) => {
        const accessToken = localStorage.getItem("authToken") ?? '';
        try {
            const response = await api.put(`/cartItems/update/${payload.cartId}/${payload.productId}?quantity=${payload.quantity}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    },
                    withCredentials: true
                });
            return { message: response.data.message as string, payload };
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Unknown error');
        }
    }
);

export const removeCartItem = createAsyncThunk(
    "cart/removeCartItem",
    async (payload: { cartId: number; productId: number; }, { rejectWithValue }) => {
        const accessToken = localStorage.getItem("authToken") ?? '';
        try {
            const response = await api.delete(`/cartItems/remove/${payload.cartId}/${payload.productId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            return { message: response.data.message as string, payload };
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Unknown error');
        }
    }
);

export interface cartState {
    cartId: number;
    items: CartItemDto[];
    totalAmount: number;
    errorMessage?: string;
    successMessage?: string;
    isLoading?: boolean;
};

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        cartId: -1,
        items: [],
        totalAmount: 0,
        isLoading: true
    } as cartState,
    reducers: {
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        resetCart(state) {
            state.cartId = -1;
            state.items = [];
            state.totalAmount = 0;
            state.errorMessage = undefined;
            state.successMessage = undefined;
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addToCart.fulfilled, (state, action) => {
                const data: CartDto = action.payload.data;
                state.cartId = data.id;

                state.items = data.items;
                state.totalAmount = data.totalAmount;
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
                state.cartId = data.id;
                state.items = data.items;
                state.totalAmount = data.totalAmount;
                state.successMessage = action.payload.message;
                state.errorMessage = undefined; // Clear any previous error message on success
                state.isLoading = false;
            })
            .addCase(getUserCarts.rejected, (state, action) => {
                state.errorMessage = "Failed to fetch user carts: " + (action.payload || action.error.message);
                state.successMessage = undefined; // Clear any previous success message on error

                console.log('action.error.message', action.error, 'action.payload', action.payload);
            })
            .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
                const payload = action.payload.payload;

                const index = state.items.findIndex(item => item.productId === payload.productId);
                if (index !== -1) {
                    const unitPrice = state.items[index].unitPrice;
                    state.items[index] = {
                        ...state.items[index],
                        quantity: payload.quantity,
                        totalPrice: unitPrice * payload.quantity
                    };
                }
                state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
                state.successMessage = action.payload.message;
                state.errorMessage = undefined; // Clear any previous error message on success
            })
            .addCase(updateCartItemQuantity.rejected, (state, action) => {
                state.errorMessage = "Failed to update cart item quantity: " + (action.payload || action.error.message);
                state.successMessage = undefined; // Clear any previous success message on error
            })
            .addCase(removeCartItem.fulfilled, (state, action) => {
                const payload = action.payload.payload;
                state.items = state.items.filter(item => item.productId !== payload.productId);
                state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
                state.successMessage = action.payload.message;
                state.errorMessage = undefined; // Clear any previous error message on success
            })
            .addCase(removeCartItem.rejected, (state, action) => {
                state.errorMessage = "Failed to remove cart item: " + (action.payload || action.error.message);
                state.successMessage = undefined; // Clear any previous success message on error        
            })
            ;
    }
});

export const { setLoading, resetCart } = cartSlice.actions;
export default cartSlice.reducer;