import { createSlice, PayloadAction } from "@reduxjs/toolkit"; 

export interface PaginationState {
    currentPage: number,
    itemsPerPage: number,
    totalItems: number
}

const initialState: PaginationState = {
    currentPage: 0,
    itemsPerPage: 10,
    totalItems: 0
};
const paginationSlice = createSlice({
    name: "pagination",
    initialState,
    reducers: {
        setCurrentPage: (state: PaginationState, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setItemsPerPage: (state: PaginationState, action: PayloadAction<number>) => {
            state.itemsPerPage = action.payload;
        },
        setTotalItems: (state: PaginationState, action: PayloadAction<number>) => {
            state.totalItems = action.payload;
        }
    }
});

export const { setCurrentPage, setItemsPerPage, setTotalItems } = paginationSlice.actions;
export default paginationSlice.reducer;