// import { useParams } from "react-router-dom";
import SearchBar from "../search/SearchBar";
import ProductCard from "./ProductCard";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ProductDto } from "../../dtos/ProductDto";
import { getAllProducts } from "../../store/features/productSlice";
import { SearchState } from "../../store/features/searchSlice";
import { AppDispatch } from "../../store/store";
import Paginator from "../common/Paginator";
import { PaginationState, setTotalItems } from "../../store/features/paginationSlice";
import SideBar from "../common/SideBar";

const Products = () => {
    const [filteredProducts, setFilteredProducts] = React.useState<ProductDto[]>([]);
    const { products, selectedBrands } = useSelector((state: { products: { products: ProductDto[]; selectedBrands: string[] } }) => state.products);
    const { searchQuery, selectedCategory } = useSelector((state: { search: SearchState }) => state.search);
    const { itemsPerPage, currentPage } = useSelector((state: { pagination: PaginationState }) => state.pagination);
    const dispatch = useDispatch<AppDispatch>();
    
    React.useEffect(() => {
        dispatch(getAllProducts());
    }, [dispatch]);

    React.useEffect(() => {
        dispatch(setTotalItems(filteredProducts.length));
    }, [filteredProducts, dispatch]);

    React.useEffect(() => {
        let filtered = products.filter(product => {
            const matchesCategory = selectedCategory === 'All Categories'
                || product.category.name.toLowerCase().includes(selectedCategory.toLowerCase());
            const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearchQuery;
        });
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(product => selectedBrands.includes(product.brand));
        }
        setFilteredProducts(filtered);
    }, [products, searchQuery, selectedCategory, selectedBrands]);

    const first = currentPage * itemsPerPage;
    const last = first + itemsPerPage;
    
    const currentProducts = filteredProducts.slice(first, last);

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
                    <div className="pagination justify-content-center">
                        <Paginator />
                    </div>
                </section>

            </div>
        </>
    );
};

export default Products;