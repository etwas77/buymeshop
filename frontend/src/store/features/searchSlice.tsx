import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
        setSearchQuery: (state: SearchState, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        setSelectedCategory: (state: SearchState, action: PayloadAction<string>) => {
            state.selectedCategory = action.payload;
        },
        clearFilter: (state: SearchState) => {            
            state.searchQuery = "";
            state.selectedCategory = "All Categories";
        }
    }
});

export const { setSearchQuery, setSelectedCategory, clearFilter } = searchSlice.actions;
export default searchSlice.reducer;