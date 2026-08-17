import _ from "lodash";
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaItunes, FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { AuthState } from "../../store/features/authSlice";
import { addToCart, cartState } from "../../store/features/cartSlice";
import { decrementQuantity, getProductById, incrementQuantity, ProductState } from "../../store/features/productSlice";
import { AppDispatch } from "../../store/store";
import ImageZoomify from "../common/ImageZoomify";
import LoadSpinner from "../common/LoadSpinner";
import QuantityUpdater from "../common/utils/QuantityUpdater";

const ProductDetails = () => {
    const { id } = useParams();

    const { product, quantity } = useSelector((state: { products: ProductState }) => state.products);
    const { successMessage, errorMessage } = useSelector((state: { cart: cartState }) => state.cart);
    const { authMe } = useSelector((state: { auth: AuthState }) => state.auth);

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const visibleAdmin = authMe?.roles?.some(role => role.name === "ADMIN");

    React.useEffect(() => {
        if (id) {
            dispatch(getProductById(id));
        }
    }, [id, dispatch]);

    const handleAddTocart = () => {
        try {
            dispatch(addToCart({ productId: product!.id, quantity }));
        } catch (error) {
            toast.error((error as Error).message || "An error occurred while adding to cart");
        }
    }

    React.useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
        }
        if (errorMessage) {
            toast.error(errorMessage);
        }
    }, [successMessage, errorMessage]);

    if (product === undefined) {
        return <LoadSpinner variant="info" />;
    }
    return (
        <div className="container">
            <ToastContainer />
            <div className="row product-details">
                <div className="col-md-2">
                    {_.map(product.images, image => {
                        return (
                            <div key={image.id} className="mt-4 image-container">
                                <ImageZoomify imageId={image.id} />
                            </div>
                        );
                    })}
                </div>
                <div className="col-md-8 details-container">
                    <h1 className="product-name">{product.name}</h1>
                    <h4 className="price">€{product.price}</h4>
                    <p className="product-description">{product.description}</p>
                    <p className="product-name">Brand: {product.brand}</p>
                    <p className="product-name">
                        Rating: <span className="rating">some stars</span>
                    </p>

                    <p className={product.inventory > 0 ? "text-success" : "text-failure"}>
                        {product.inventory > 0 ? "In stock " + product.inventory : "Out of stock"}
                    </p>
                    <div className="product-category">Quantity:
                        <QuantityUpdater
                            quantityLimit={product.inventory}
                            quantity={quantity}
                            increment={() => dispatch(incrementQuantity())}
                            decrement={() => dispatch(decrementQuantity())}
                        />
                    </div>
                </div>
                <div className="d-flex gap-2 mt-3" >
                    <OverlayTrigger overlay={<Tooltip>
                        {authMe === undefined ? "login to add to cart" : (quantity === 0 ? "add at least one item to cart" : " add to cart")}
                    </Tooltip>}>
                        <button className="add-to-cart-button" onClick={handleAddTocart} disabled={product.inventory === 0 || !authMe || quantity === 0}>
                            <FaShoppingCart />
                            {"add to cart"}
                        </button>
                    </OverlayTrigger>
                    {/* <button className="buy-now-button">
                        <FaShoppingBasket />
                        {" buy now"}

                    </button> */}

                    {visibleAdmin &&
                        <button className="buy-now-button" onClick={() => navigate("/manage/" + product.id)}>
                            <FaItunes />
                            {"manage item"}
                        </button>}
                </div>
            </div>

        </div>
    );
};

export default ProductDetails;