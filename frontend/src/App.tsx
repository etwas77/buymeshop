import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Home from "./component/home/Home";
import RootLayout from "./component/layout/RootLayout";
import Products from "./component/product/Products";
import ProductDetails from "./component/product/ProductDetails";
import Login from "./component/auth/Login";
import 'react-toastify/dist/ReactToastify.css';
import Cart from "./component/cart/Cart";
import Order from "./component/order/Order";
import ManageProducts from "./component/product/ManageProducts";
import Register from "./component/auth/Register";
import Account from "./component/auth/Account";
import ProtectedRoute from "./component/auth/ProtectedRoute";
import AdminPanel from "./component/admin/AdminPanel";

function App() {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<RootLayout />} >
                <Route index element={<Home />} />
                <Route path="/products/:name?" element={<Products />} />
                <Route path="/products/:id/details" element={<ProductDetails />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<div className="text-center mt-5"><h1>Unauthorized Access</h1><p>You do not have permission to view this page.</p></div>} />

                <Route element={<ProtectedRoute useOutlet />}>          
                    <Route path="/cart/:userId" element={<Cart />} />       {/* needs authentication */}
                    <Route path="/orders/:userId" element={<Order />} />    {/* needs authentication */}
                    <Route path="/account" element={<Account />} />         {/* needs authentication */}
                </Route>

                <Route element={<ProtectedRoute useOutlet allowRoles={["ADMIN"]} />}>
                    <Route path="/manage/:productId?" element={<ManageProducts />} /> {/* needs authentication AND specific (ADMIN) role/s */}
                    <Route path="/admin" element={<AdminPanel />} /> {/* needs authentication AND specific (ADMIN) role/s */}
                </Route>
            </Route>
        )
    );
    return (
        <RouterProvider router={router} />
    );
}

export default App;
