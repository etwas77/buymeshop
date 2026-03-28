import { createSlice } from "@reduxjs/toolkit";

export interface SearchState {
    searchQuery: string;   
    selectedCategory: string;
}

const searchSlice = createSlice({
    name: "search",
    initialState: {
        searchQuery: "",
        selectedCategory: "All Categories",
    } as SearchState,
    reducers: {
        setSearchQuery: (state, action: { payload: string }) => {
            state.searchQuery = action.payload;
        },
        setSelectedCategory: (state, action: { payload: string }) => {
            state.selectedCategory = action.payload;
        }
    }
});

export const { setSearchQuery, setSelectedCategory } = searchSlice.actions;
export default searchSlice.reducer;