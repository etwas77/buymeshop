import _ from "lodash";
import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProductDto } from "../../dtos/ProductDto";
import Paginator from "../common/Paginator";
import ProductImage from "../common/utils/ProductImage";
import Hero from "../hero/Hero";
import { getDistinctProductsByName, getProductsByCategory } from "../services/ProductService";
import { useSelector } from 'react-redux';

const ITEMS_PER_PAGE = 10;

const Home = () => {
    const [currentPage, setCurrentPage] = React.useState<number>(0);
    const [filteredProducts, setFilteredProducts] = React.useState<ProductDto[]>([]);
    const [products, setProducts] = React.useState<ProductDto[]>([]);
    const [showProducts, setShowProducts] = React.useState<ProductDto[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const { searchQuery, selectedCategory } = useSelector((state: any) => state.search);    

    if (error)
        console.log('error', error);

    React.useEffect(() => {
        if (searchQuery.length > 0) {
            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
        else {
            setFilteredProducts(products);
        }
    }, [searchQuery, products]);

    const itemsPerPage = products.length > ITEMS_PER_PAGE ? ITEMS_PER_PAGE : products.length;
    const totalItems = products.length;

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
    }, []);

    React.useEffect(() => {
        const fetchProductsByCategory = async (selectedCategory: string) => {
            try {
                const response = await getProductsByCategory(selectedCategory);
                setFilteredProducts(response.data);
            }
            catch (error: any) {
                setError(error.message);
                toast.error("getProductsByCategory failed: " + error.message);
            }
        };

        if(selectedCategory !== 'All Categories') {
            fetchProductsByCategory(selectedCategory);
        }
        else {
            setFilteredProducts(products);
        }
    }, [selectedCategory, products]);

    const paginate = React.useMemo(() => (i: number) => {
        console.log('i', i - 1);
        setCurrentPage(i - 1);
    }, []);

    React.useEffect(() => {
        const productsToPaginate = filteredProducts.length > 0 ? filteredProducts : products;
        const first = currentPage * itemsPerPage;
        const last = first + itemsPerPage;
        setShowProducts(productsToPaginate.slice(first, last));
    }, [products, filteredProducts, currentPage, itemsPerPage]);


    return (
        <>
            <Hero />
            <div className="d-flex flex-wrap justify-content-center p-5">
                <ToastContainer />
                {_.map(showProducts, product => {
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
                totalItems={totalItems}
                currentPage={currentPage}
                paginate={paginate}
            />
        </>
    );
};

export default Home;