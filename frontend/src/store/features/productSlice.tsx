import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { api } from "../../component/services/api";
import { ProductDto } from "../../dtos/ProductDto";


export const getAllProducts = createAsyncThunk(
    "product/getAllProducts",
    async () => {
        try {
            const response = await api.get("/products");
            return response.data.data as ProductDto[];
        }
        catch (error: any) {
            toast.error("Error fetching products: " + error.message);
            return [];
        }
    }
);

export interface ProductState {
    products: ProductDto[];
    errorMessage?: string;
    isLoading: boolean;
}

const productSlice = createSlice({
    name: "product",
    initialState: {
        products: [],
        isLoading: false
    } as ProductState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(getAllProducts.fulfilled, (state, action) => {
            state.products = action.payload;
            state.isLoading = false;
        })
        .addCase(getAllProducts.rejected, (state, action) => {
            toast.error("Failed to fetch products: " + action.error.message);
            state.errorMessage = action.error.message;
            state.isLoading = false;
        })
        .addCase(getAllProducts.pending, (state, action) => {
            state.isLoading = true;
        })
        ;
    }
});

export default productSlice.reducer;