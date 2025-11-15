import { configureStore } from "@reduxjs/toolkit";
import { Data } from "./Data";



export const store = configureStore({
    reducer: {
        products: Data.reducer,
        teams : Data.reducer,
        portfoilos : Data.reducer,
        blogs : Data.reducer,
        shopSingle: Data.reducer
    }
})