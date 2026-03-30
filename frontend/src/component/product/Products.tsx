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
import { ITEMS_PER_PAGE } from "../home/Home";

const Products = () => {
    const [currentPage, setCurrentPage] = React.useState<number>(0);
    const [filteredProducts, setFilteredProducts] = React.useState<ProductDto[]>([]);
    const { products } = useSelector((state: { products: { products: ProductDto[] } }) => state.products);
    const { searchQuery, selectedCategory } = useSelector((state: { search: SearchState }) => state.search);
    const dispatch = useDispatch<AppDispatch>();

    React.useEffect(() => {
        dispatch(getAllProducts());
    }, [dispatch]);

    const paginate = React.useMemo(() => (i: number) => {
        console.log('i', i - 1);
        setCurrentPage(i - 1);
    }, []);

    React.useEffect(() => {
        const filtered = products.filter(product => {
            const matchesCategory = selectedCategory === 'All Categories'
                || product.category.name.toLowerCase().includes(selectedCategory.toLowerCase());
            const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearchQuery;
        });
        setFilteredProducts(filtered);
    }, [products, searchQuery, selectedCategory]);

    const itemsPerPage = filteredProducts.length > ITEMS_PER_PAGE ? ITEMS_PER_PAGE : filteredProducts.length;
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
            <div className="d-flex ">
                <aside className="sidebar" style={{ width: '250px', padding: '1rem' }}>
                    sidebar coming here
                </aside>
                <section style={{ flex: 1 }}>
                    <ProductCard products={currentProducts} />
                    <div className="pagination">
                        <Paginator
                            itemsPerPage={itemsPerPage}
                            totalItems={currentProducts.length}
                            currentPage={currentPage}
                            paginate={paginate}
                        />
                    </div>
                </section>

            </div>
        </>
    );
};

export default Products;