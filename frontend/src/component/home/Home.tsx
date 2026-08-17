import _ from "lodash";
import React from "react";
import { Card } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProductDto } from "../../dtos/ProductDto";
import { PaginationState, setTotalItems } from "../../store/features/paginationSlice";
import { getAllDistinctProducts, ProductState } from "../../store/features/productSlice";
import Paginator from "../common/Paginator";
import ProductImage from "../common/utils/ProductImage";
import Hero from "../hero/Hero";
import LoadSpinner from "../common/LoadSpinner";
import { SearchState } from "../../store/features/searchSlice";

const Home = () => {
    const [filteredProducts, setFilteredProducts] = React.useState<ProductDto[]>([]);
    const { searchQuery, selectedCategory, searchResults } = useSelector((state: { search: SearchState }) => state.search);
    const { itemsPerPage, currentPage } = useSelector((state: { pagination: PaginationState }) => state.pagination);
    const { distinctProducts: products, isLoading } = useSelector((state: { products: ProductState }) => state.products);
    const dispatch = useDispatch<AppDispatch>();
    
    React.useEffect(() => {
        dispatch(getAllDistinctProducts());
    }, [dispatch]);

    const first = currentPage * itemsPerPage;
    const last = first + itemsPerPage;
    const currentProducts = filteredProducts.slice(first, last);

    React.useEffect(() => {
        dispatch(setTotalItems(filteredProducts.length));
    }, [filteredProducts, dispatch]);

    React.useEffect(() => {
        const filtered = products.filter(product => {
            const matchesCategory = selectedCategory === 'All Categories'
                || product.category.name.toLowerCase().includes(selectedCategory.toLowerCase());
            const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesImageSearch = searchResults === undefined ? true : (searchResults.length > 0 && searchResults.includes(product.id));
            return matchesCategory && matchesSearchQuery && matchesImageSearch;
        });
        setFilteredProducts(filtered);
    }, [products, searchQuery, selectedCategory, searchResults]);

    if (isLoading) {
        return <div>
            <LoadSpinner variant="secondary" />
        </div>;
    }

    return (
        <>
            <Hero />
            <div className="d-flex flex-wrap justify-content-center p-5">
                <ToastContainer />
                {_.map(currentProducts, product => {
                    const imageId: string | undefined = product.images.length === 0 ? undefined : product.images[0].id;
                    return (
                        <Card key={product.id} className="home-product-card">
                            <Link to={"/products/" + product.id + "/details"} className="link" >
                                {imageId && <ProductImage imageId={imageId} />}
                                {imageId === undefined && <div className="no-image text-center">No Image</div>}
                            </Link>
                            <Card.Body>
                                <h4 className="price">€{product.price}</h4>
                                <p className={product.inventory > 0 ? "text-success" : "text-failure"}>
                                    {product.inventory > 0 ? "In stock " + product.inventory : "Out of stock"}
                                </p>
                                <Link to={"/products/" + product.name} className="shop-now-button">show details</Link>
                                <p className="product-name">{product.name}</p>
                                <p className="product-description">{product.description}</p>
                            </Card.Body>
                        </Card>);
                })}
            </div>
            <Paginator />
        </>
    );
};

export default Home;