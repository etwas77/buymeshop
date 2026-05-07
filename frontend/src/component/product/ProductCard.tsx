import _ from "lodash";
import { Card } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { ProductDto } from "../../dtos/ProductDto";
import ProductImage from "../common/utils/ProductImage";
import { addToCart } from "../../store/features/cartSlice";
import { AppDispatch } from "../../store/store";

export interface ProductCardProps {
    products: ProductDto[];
}

const ProductCard = (p: ProductCardProps) => {
    const { products } = p;
    const dispatch = useDispatch<AppDispatch>();

    const handleAddTocart = (productId: string) => () => {
        dispatch(addToCart({ productId, quantity: 1 }));
    }

    return (
        <main className="row m-2">
            {_.map(products, product => {
                const imageId: string | undefined = product.images.length === 0 ? undefined : product.images[0].id;

                return (
                    <div className="col-12 col-sm-6 col-md-4 col-lg-2" key={product.id}>
                        <Card className="mb-2 mt-2">
                            <Link to={"/products/" + product.id + "/details"} className="link" >
                                {imageId && <ProductImage imageId={imageId} />}
                                {!imageId && <div>no image available</div>}
                            </Link>
                            <Card.Body>
                                <h4 className="price">${product.price}</h4>
                                <p className={product.inventory > 0 ? "text-success" : "text-failure"}>
                                    {product.inventory > 0 ? "In stock " + product.inventory : "Out of stock"}
                                </p>
                                <div className="d-flex gap-2">
                                    <button className="shop-now-button" onClick={handleAddTocart(product.id)}>
                                        {" add to cart"}
                                    </button>
                                </div>
                                <p className="product-name">{product.name}</p>
                                <p className="product-description">{product.description}</p>
                            </Card.Body>
                        </Card>
                    </div>
                );
            })}
        </main>
    );
};

export default ProductCard;