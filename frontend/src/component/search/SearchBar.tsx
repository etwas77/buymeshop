import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CategoryDto } from "../../dtos/CategoryDto";
import { getAllCategories } from "../../store/features/categorySlice";
import { clearFilter, SearchState, setSearchQuery, setSelectedCategory } from "../../store/features/searchSlice";
import type { AppDispatch } from "../../store/store";
import ImageSearch from "./ImageSearch";

const SearchBar = () => {
    const { categories } = useSelector((state: { category: { categories: CategoryDto[] } }) => state.category);
    const { searchQuery, selectedCategory } = useSelector((state: { search: SearchState }) => state.search);
    const dispatch = useDispatch<AppDispatch>();
    const [showImageSearch, ] = React.useState<boolean>(false);

    React.useEffect(() => {
        dispatch(getAllCategories());
    }, [dispatch]);

    return (
        <>
        <div className="search-bar input-group input-group-sm ">
            <select
                className="form-control-sm me-2"
                onChange={(e) => dispatch(setSelectedCategory(e.target.value))}
                value={selectedCategory}
            >
                <option value="All Categories">All Categories</option>
                {_.map(categories, (category) => (
                    <option key={category.id} value={category.name} >
                        {category.name}
                    </option>
                ))}
            </select>
            <input
                type="text"
                className="form-control me-2"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            />
            {/* <button className="search-button me-2" onClick={() => setShowImageSearch((prev) => !prev)}><BsSearch />by Image</button> */}
            <button className="search-button" onClick={() => dispatch(clearFilter())}>Clear Filter</button>
        </div>
        {showImageSearch && <ImageSearch />}
        </>
    );
};

export default SearchBar;