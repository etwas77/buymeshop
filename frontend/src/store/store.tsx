import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "./features/searchSlice";
import categoryReducer from "./features/categorySlice";
import productsReducer from "./features/productSlice";
import paginationReducer from "./features/paginationSlice";
import cartReducer from "./features/cartSlice";

export const store = configureStore({
    reducer: {
        search: searchReducer,
        category: categoryReducer,
        products: productsReducer,
        pagination: paginationReducer,
        cart: cartReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

