import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Home from "./component/home/Home";
import RootLayout from "./component/layout/RootLayout";
import Products from "./component/product/Products";

function App() {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<RootLayout />} >
                <Route index element={<Home />} />
                <Route path="/products" element={<Products />} />
            </Route>
        )
    );
    return (
        <RouterProvider router={router} />
    );
}

export default App;
