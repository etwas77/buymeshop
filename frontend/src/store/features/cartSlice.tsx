import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "../../component/services/api";
import { CartDto } from "../../dtos/CartDto";
import { CartItemDto } from "../../dtos/CartItemDto";
import { AuthState } from "./authSlice";

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async (payload: { productId: string; quantity: number }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("productId", payload.productId);
            formData.append("quantity", payload.quantity.toString());

            const response = await authApi.post("/cartItems/add", formData);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Unknown error');
        }
    }
);

export const getCartsMe = createAsyncThunk(
    "cart/getCartsMe",
    async (_payload, { rejectWithValue }) => {
        try {
            const response = await authApi.get("/carts/me");
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message || 'Unknown error');
        }
    },
    {
        condition: (_payload, { getState }) => {
            const state = getState() as { cart: cartState };
            const { requestStatus, currentUserId } = state.cart;
            const stateAuth = getState() as { auth: AuthState };
            const { authMe } = stateAuth.auth;

            // Prevent duplicate in-flight requests for the same user.
            return !(requestStatus === "loading" && currentUserId === authMe?.id);
        },
    }
);



export const updateCartItemQuantity = createAsyncThunk(
    "cart/updateCartItemQuantity",
    async (payload: { cartId: number; productId: number; quantity: number }, { rejectWithValue }) => {
        try {
            const response = await authApi.put(`/cartItems/update/${payload.cartId}/${payload.productId}?quantity=${payload.quantity}`);
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
        try {
            const response = await authApi.delete(`/cartItems/remove/${payload.cartId}/${payload.productId}`);
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
    cart?: CartDto;
    items: CartItemDto[];
    totalAmount: number;
    errorMessage?: string;
    successMessage?: string;
    isLoading?: boolean;
    requestStatus?: "idle" | "loading" | "succeeded" | "failed";
    currentUserId?: string;
};

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        cartId: -1,
        cart: undefined,
        items: [],
        totalAmount: 0,
        isLoading: true,
        requestStatus: "idle"
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
            state.requestStatus = "idle";
            state.currentUserId = undefined;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCartsMe.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = undefined;
                state.requestStatus = "loading";
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                const data: CartDto = action.payload.data;
                state.cart = data;
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
            .addCase(getCartsMe.fulfilled, (state, action) => {
                const data: CartDto = action.payload.data;
                state.cart = data;
                state.cartId = data.id;
                state.items = data.items;
                state.totalAmount = data.totalAmount;
                state.successMessage = action.payload.message;
                state.errorMessage = undefined; // Clear any previous error message on success
                state.isLoading = false;
                state.requestStatus = "succeeded";
            })
            .addCase(getCartsMe.rejected, (state, action) => {
                //state.errorMessage = "Failed to fetch user carts: " + (action.payload || action.error.message);
                state.successMessage = undefined; // Clear any previous success message on error
                state.isLoading = false;
                state.requestStatus = "failed";

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
                state.cart = undefined;
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