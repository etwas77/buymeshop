import { useParams } from "react-router-dom";
import AddProduct from "./AddProduct";

const ManageProducts = () => {
const { productId } = useParams();

    return (
        <div>
            <AddProduct productId={productId} />

        </div>
    );
};

export default ManageProducts;