import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Home from "./component/home/Home";
import RootLayout from "./component/layout/RootLayout";

function App() {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<RootLayout />} >
                <Route index element={<Home />} />
            </Route>
        )
    );
    return (
        <RouterProvider router={router} />
    );
}

export default App;
