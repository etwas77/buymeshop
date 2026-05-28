import { useParams } from "react-router-dom";
import AddProduct from "./AddProduct";
import { ToastContainer } from "react-toastify";

const ManageProducts = () => {
    const { productId } = useParams();    

    return (
        <div>
            <ToastContainer />
            <AddProduct productId={productId} />

        </div>
    );
};

export default ManageProducts;