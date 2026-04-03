import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getProductById, ProductState } from "../../store/features/productSlice";
import { AppDispatch } from "../../store/store";
import ImageZoomify from "../common/ImageZoomify";
import LoadSpinner from "../common/LoadSpinner";
import QuantityUpdater from "../common/utils/QuantityUpdater";


const ProductDetails = () => {
    const { id } = useParams();

    const { product } = useSelector((state: { products: ProductState }) => state.products);
    const dispatch = useDispatch<AppDispatch>();
    const [quantity, setQuantity] = React.useState<number>(0);

    React.useEffect(() => {
        if (id) {
            dispatch(getProductById(id));
        }
    }, [id, dispatch]);

    const onIncrease = () => {
        setQuantity(prev => prev + 1);
    };

    const onDecrease = () => {
       setQuantity(prev => prev > 0 ? prev - 1 : 0);
    };

    if (product === undefined) {
        return <LoadSpinner variant="info" />;
    }
    return (
        <div className="container">
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
                    <h4 className="price">${product.price}</h4>
                    <p className="product-description">{product.description}</p>
                    <p className="product-name">Brand: {product.brand}</p>
                    <p className="product-name">
                        Rating: <span className="rating">some stars</span>
                    </p>

                    <p className={product.inventory > 0 ? "text-success" : "text-failure"}>
                        {product.inventory > 0 ? "In stock " + product.inventory : "Out of stock"}
                    </p>
                    <div className="product-category">Quantity:
                        <QuantityUpdater quantity={quantity} onIncrease={onIncrease} onDecrease={onDecrease} />
                    </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                    <button className="add-to-cart-button">add to cart</button>
                    <button className="buy-now-button">buy now</button>
                </div>
            </div>

        </div>
    );
};

export default ProductDetails;