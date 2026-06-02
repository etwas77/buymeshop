import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { api, authApi } from "../../component/services/api";
import { AddProductRequestDto } from "../../dtos/AddProductRequestDto";
import { ProductDto } from "../../dtos/ProductDto";


export const getAllProducts = createAsyncThunk(
    "products/getAllProducts",
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

export const addNewProduct = createAsyncThunk(
    "products/addNewProduct",
    async (addProductRequest: AddProductRequestDto) => {
        try {
            const response = await authApi.post("/products/add", addProductRequest);
            return response.data.data as ProductDto;
        }
        catch (error: any) {
            toast.error("Error adding product: " + error.message);
            return undefined;
        }
    }
);

export const getAllBrands = createAsyncThunk(
    "products/getAllBrands",
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
    "products/getAllDistinctProducts",
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

export const getProductById = createAsyncThunk(
    "products/getProductById",
    async (id: string) => {
        try {
            const response = await api.get("/products/product/" + id);
            return response.data.data as ProductDto;
        }
        catch (error: any) {
            toast.error("Error fetching product: " + error.message);
            return undefined;
        }
    }
);

export const updateProductById = createAsyncThunk(
    "products/updateProductById",
    async (payload: { productUpdateRequest: AddProductRequestDto, id: string }) => {
        try {
            const response = await authApi.put("/products/update/" + payload.id, payload.productUpdateRequest);
            return response.data.data as ProductDto;
        }
        catch (error: any) {
            toast.error("Error updating product: " + error.message);
            return undefined;
        }
    }
);

export const deleteProductById = createAsyncThunk(
    "products/deleteProductById",
    async (productId: string) => {
        try {
            const response = await authApi.delete("/products/delete/" + productId);
            return response.data as {message: string};
        }
        catch (error: any) {
            toast.error("Error deleting product: " + error.message);
            return undefined;
        }
    }
);

export const removeImageByIdProductById = createAsyncThunk(
    "products/removeImageByIdProductById",
    async (payload: { imageId: string, productId: string }) => {
        try {
            const response = await authApi.delete("/products/" + payload.productId + "/images/" + payload.imageId);
            return response.data.data as ProductDto;
        }
        catch (error: any) {
            toast.error("Error removing image: " + error.message);
            return undefined;
        }
    }
);

export interface ProductState {
    products: ProductDto[];
    distinctProducts: ProductDto[];
    product?: ProductDto;
    errorMessage?: String;
    isLoading: boolean;
    brands: String[];
    selectedBrands: String[];
    quantity: number;
}

const productSlice = createSlice({
    name: "products",
    initialState: {
        products: [],
        distinctProducts: [],
        product: undefined,
        isLoading: false,
        brands: [],
        selectedBrands: [],
        quantity: 0,
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
        incrementQuantity: (state: ProductState) => {
            state.quantity++;
        },
        decrementQuantity: (state: ProductState) => {
            state.quantity = state.quantity > 0 ? state.quantity - 1 : 0;
        },
        addBrand: (state: ProductState, action: PayloadAction<String>) => {
            state.brands = [...state.brands, action.payload];
        },
        unsetProduct: (state: ProductState) => {
            state.product = undefined;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllDistinctProducts.fulfilled, (state, action) => {
                state.distinctProducts = action.payload;
                state.isLoading = false;
            })
            .addCase(getProductById.fulfilled, (state, action) => {
                state.product = action.payload;
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
            .addCase(getAllProducts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addNewProduct.fulfilled, (state, action) => {
                if (action.payload) {
                    state.products.push(action.payload);
                    state.product = action.payload;
                    toast.success("Product added successfully!");
                }
                state.isLoading = false;
            })
            .addCase(addNewProduct.rejected, (state, action) => {
                toast.error("Failed to add product: " + action.error.message);
                state.errorMessage = action.error.message;
                state.isLoading = false;
            })
            .addCase(updateProductById.fulfilled, (state, action) => {
                if (action.payload) {
                    const index = state.products.findIndex(p => p.id === action.payload!.id);
                    if (index !== -1) {
                        state.products[index] = action.payload;
                    }
                    state.product = action.payload;
                    toast.success("Product updated successfully!");
                }
                state.isLoading = false;
            })
            .addCase(removeImageByIdProductById.fulfilled, (state, action) => {
                if (state.product) {
                    state.product = action.payload;
                }
                state.isLoading = false;
            })
            .addCase(deleteProductById.fulfilled, (state, action) => {
                if (action.payload) {
                    state.products = state.products.filter(p => p.id !== state.product?.id);
                    state.product = undefined;
                    toast.success("Product deleted successfully!");
                }                
                state.isLoading = false;
             })
            ;
    }
});

export const { filterByBrand, incrementQuantity, decrementQuantity, addBrand, unsetProduct } = productSlice.actions;
export default productSlice.reducer;