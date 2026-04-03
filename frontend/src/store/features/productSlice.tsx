import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
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

export const getAllBrands = createAsyncThunk(
    "product/getAllBrands",
    async () => {
        try {
            const response = await api.get("/products/distinct/brands");
            return response.data.data as String[];
        }
        catch (error: any) {
            toast.error("Error fetching brands: " + error.message);
            return [];
        }
    }
);

export const getAllDistinctProducts = createAsyncThunk(
    "product/getAllDistinctProducts",
    async () => {
        try {
            const response = await api.get("/products/distinct/products");            
            return response.data.data as ProductDto[];
        }
        catch (error: any) {
            toast.error("Error fetching distinct products: " + error.message);
            return [];
        }
    }
);
export interface ProductState {
    products: ProductDto[];
    distinctProducts: ProductDto[];
    errorMessage?: String;
    isLoading: boolean;
    brands: String[];
    selectedBrands: String[];
}

const productSlice = createSlice({
    name: "product",
    initialState: {
        products: [],
        distinctProducts: [],
        isLoading: false,
        brands: [],
        selectedBrands: []
    } as ProductState,
    reducers: {
        filterByBrand: (state: ProductState, action: PayloadAction<String>) => {
            const itemPresent = state.selectedBrands.includes(action.payload);
            if (itemPresent) {
                state.selectedBrands = state.selectedBrands.filter(brand => brand !== action.payload);
                return;
            }
            state.selectedBrands = [...state.selectedBrands, action.payload];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllDistinctProducts.fulfilled, (state, action) => {
                state.distinctProducts = action.payload;
                state.isLoading = false;
            })
            .addCase(getAllBrands.fulfilled, (state, action) => {
                state.brands = action.payload;
                state.isLoading = false;
            })
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

export const { filterByBrand } = productSlice.actions;
export default productSlice.reducer;