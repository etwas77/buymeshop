import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Home from "./component/home/Home";
import RootLayout from "./component/layout/RootLayout";
import Products from "./component/product/Products";
import ProductDetails from "./component/product/ProductDetails";
import Login from "./component/home/Login";

function App() {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<RootLayout />} >
                <Route index element={<Home />} />
                <Route path="/products/:name?" element={<Products />} />
                <Route path="/products/:id/details" element={<ProductDetails />} />
                <Route path="/login" element={<Login />} />
            </Route>
        )
    );
    return (
        <RouterProvider router={router} />
    );
}

export default App;
