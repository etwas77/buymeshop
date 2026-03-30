import _ from "lodash";
import React from "react";
import { Card } from "react-bootstrap";
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProductDto } from "../../dtos/ProductDto";
import Paginator from "../common/Paginator";
import ProductImage from "../common/utils/ProductImage";
import Hero from "../hero/Hero";
import { getDistinctProductsByName } from "../services/ProductService";

export const ITEMS_PER_PAGE = 5;

const Home = () => {
    const [currentPage, setCurrentPage] = React.useState<number>(0);
    const [filteredProducts, setFilteredProducts] = React.useState<ProductDto[]>([]);
    const [products, setProducts] = React.useState<ProductDto[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const { searchQuery, selectedCategory } = useSelector((state: any) => state.search);

    if (error)
        console.log('error', error);

    React.useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getDistinctProductsByName();
                setProducts(response.data);
            }
            catch (error: any) {
                setError(error.message);
                toast.error("Error fetching products: " + error.message);
                setProducts([]);
            }
        };
        fetchProducts();

    }, [selectedCategory]);

    const paginate = React.useMemo(() => (i: number) => {
        console.log('i', i - 1);
        setCurrentPage(i - 1);
    }, []);

    const itemsPerPage = filteredProducts.length > ITEMS_PER_PAGE ? ITEMS_PER_PAGE : filteredProducts.length;
    const first = currentPage * itemsPerPage;
    const last = first + itemsPerPage;
    const currentProducts = filteredProducts.slice(first, last);

    React.useEffect(() => {
        const filtered = products.filter(product => {
            const matchesCategory = selectedCategory === 'All Categories'
                || product.category.name.toLowerCase().includes(selectedCategory.toLowerCase());
            const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearchQuery;
        });
        setFilteredProducts(filtered);
    }, [products, searchQuery, selectedCategory]);

    return (
        <>
            <Hero />
            <div className="d-flex flex-wrap justify-content-center p-5">
                <ToastContainer />
                {_.map(currentProducts, product => {
                    const imageId: string | undefined = product.images.length === 0 ? undefined : product.images[0].id;
                    return (
                        <Card key={product.id} className="home-product-card">
                            <Link to={"/products/" + product.name} className="link" >
                                {imageId && <ProductImage imageId={imageId} />}
                            </Link>
                            <Card.Body>
                                <h4 className="price">${product.price}</h4>
                                <p className={product.inventory > 0 ? "text-success" : "text-failure"}>
                                    {product.inventory > 0 ? "In stock " + product.inventory : "Out of stock"}
                                </p>
                                <Link to={"/products/" + product.name} className="shop-now-button">add to cart</Link>
                                <p className="product-name">{product.name}</p>
                                <p className="product-description">{product.description}</p>
                            </Card.Body>
                        </Card>);
                })}
            </div>
            <Paginator
                itemsPerPage={itemsPerPage}
                totalItems={currentProducts.length}
                currentPage={currentPage}
                paginate={paginate}
            />
        </>
    );
};

export default Home;