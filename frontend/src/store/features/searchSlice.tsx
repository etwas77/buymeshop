import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../component/services/api";

export const searchByImage = createAsyncThunk(
    "search/searchByImage",
    async (imageFile: File) => {
        const formData = new FormData();
        formData.append("file", imageFile);
        const response = await api.post("/images/search-by-image", formData, {
            headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: false
        });
        return response.data.data as string[];
    }
);
export interface SearchState {
    searchQuery: string;
    selectedCategory: string;
    imageSearch?: string;
    imageSearchResults?: string[];
}

const searchSlice = createSlice({
    name: "search",
    initialState: {
        searchQuery: "",
        selectedCategory: "All Categories",
    } as SearchState,
    reducers: {
        setSearchQuery: (state: SearchState, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        setSelectedCategory: (state: SearchState, action: PayloadAction<string>) => {
            state.selectedCategory = action.payload;
        },
        clearFilter: (state: SearchState) => {
            state.searchQuery = "";
            state.selectedCategory = "All Categories";
            state.imageSearch = undefined;
            state.imageSearchResults = undefined;
        },
        setImageSearch(state: SearchState, action: PayloadAction<string>) {
            state.imageSearch = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(searchByImage.fulfilled, (state, action) => {
            state.imageSearchResults = action.payload;
        });
    }
});

export const { setSearchQuery, setSelectedCategory, clearFilter, setImageSearch } = searchSlice.actions;
export default searchSlice.reducer;