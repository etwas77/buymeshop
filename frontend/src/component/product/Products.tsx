// import { useParams } from "react-router-dom";
import SearchBar from "../search/SearchBar";
import ProductCard from "./ProductCard";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ProductDto } from "../../dtos/ProductDto";
import { getAllProducts, ProductState } from "../../store/features/productSlice";
import { SearchState, setSearchQuery } from "../../store/features/searchSlice";
import { AppDispatch } from "../../store/store";
import Paginator from "../common/Paginator";
import { PaginationState, setTotalItems } from "../../store/features/paginationSlice";
import SideBar from "../common/SideBar";
import { useLocation, useParams } from "react-router";
import LoadSpinner from "../common/LoadSpinner";

const Products = () => {
    const [filteredProducts, setFilteredProducts] = React.useState<ProductDto[]>([]);
    const { products, selectedBrands, isLoading } = useSelector((state: { products: ProductState }) => state.products);
    const { searchQuery, selectedCategory, searchResults } = useSelector((state: { search: SearchState }) => state.search);
    const { itemsPerPage, currentPage } = useSelector((state: { pagination: PaginationState }) => state.pagination);
    const dispatch = useDispatch<AppDispatch>();
    const { name } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialSearchQuery = queryParams.get("search") || name || "";
    
    React.useEffect(() => {
        dispatch(getAllProducts());
    }, [dispatch]);

    React.useEffect(() => {
        dispatch(setSearchQuery(initialSearchQuery));
    }, [dispatch, initialSearchQuery]);

    React.useEffect(() => {
        dispatch(setTotalItems(filteredProducts.length));
    }, [filteredProducts, dispatch]);

    React.useEffect(() => {
        let filtered = products.filter(product => {
            const matchesCategory = selectedCategory === 'All Categories'
                || product.category.name.toLowerCase().includes(selectedCategory.toLowerCase());
            const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
            const matchesImageSearch = searchResults === undefined ? true : (searchResults.length > 0 && searchResults.includes(product.id));
            return matchesCategory && matchesSearchQuery && matchesBrand && matchesImageSearch;
        });
        setFilteredProducts(filtered);
    }, [products, searchQuery, selectedCategory, selectedBrands, searchResults]);

    const first = currentPage * itemsPerPage;
    const last = first + itemsPerPage;

    const currentProducts = filteredProducts.slice(first, last);  

    if (isLoading) {
        return <div>
            <LoadSpinner variant="secondary" />
        </div>;
    }

    return (
        <>
            <div className="d-flex justify-content-center">
                <div className="col-md-6 mt-2">
                    <div className="search-bar input-group">
                        <SearchBar />
                    </div>
                </div>
            </div>
            <div className="d-flex">
                <aside className="sidebar" style={{ width: '250px', padding: '1rem' }}>
                    <SideBar />
                </aside>
                <section style={{ flex: 1 }}>
                    <ProductCard products={currentProducts} />
                </section>
            </div>
            <Paginator />
        </>
    );
};

export default Products;