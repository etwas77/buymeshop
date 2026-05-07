import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { api } from "../../component/services/api";
import { CategoryDto } from "../../dtos/CategoryDto";


export const getAllCategories = createAsyncThunk(
    "category/getAllCategories",
    async () => {
        try {
            const response = await api.get("/categories/all");
            return response.data.data as CategoryDto[];
        }
        catch (error: any) {
            toast.error("Error fetching categories: " + error.message);
            return [];
        }
    }
);

export interface CategoryState {
    categories: CategoryDto[];
    errorMessage?: string;
    isLoading: boolean;
}

const categorySlice = createSlice({
    name: "category",
    initialState: {
        categories: [],
        isLoading: false
    } as CategoryState,
    reducers: {
        addCategory: (state, action: PayloadAction<CategoryDto | undefined>) => {
            if (action.payload)
                state.categories.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
                state.isLoading = false;
            })
            .addCase(getAllCategories.rejected, (state, action) => {
                toast.error("Failed to fetch categories: " + action.error.message);
                state.errorMessage = action.error.message;
                state.isLoading = false;
            })
            .addCase(getAllCategories.pending, (state) => {
                state.isLoading = true;
            })
            ;
    }
});

export const { addCategory } = categorySlice.actions;
export default categorySlice.reducer;