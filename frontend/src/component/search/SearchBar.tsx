import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../store/features/categorySlice";
import type { AppDispatch } from "../../store/store";
import { CategoryDto } from "../../dtos/CategoryDto";
import { setSelectedCategory } from "../../store/features/searchSlice";

export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
}

const SearchBar = (p: SearchBarProps) => {
    const { value, onChange, onClear } = p;
    const { categories } = useSelector((state: any) => state.category);
    const dispatch = useDispatch<AppDispatch>();
    const [category, setCategory] = React.useState<CategoryDto | undefined>(undefined);

    React.useEffect(() => {
        dispatch(getAllCategories());
    }, [dispatch]);

    const onSelectCategory = React.useMemo(() => (s: string) => {
        const cat = categories.find((c: CategoryDto) => c.name === s);
        setCategory(cat);
        dispatch(setSelectedCategory(s));
    }, [categories, dispatch]);

    const onClearFilter = React.useCallback(() => {
        setCategory(undefined);
        dispatch(setSelectedCategory("All Categories"));
        if(onClear) 
            onClear();
    }, [onClear, dispatch]);

    return (
        <div className="search-bar input-group input-group-sm ">
            <select
                className="form-control-sm"
                onChange={(e) => onSelectCategory(e.target.value)}
                value={category?.name ?? 'All Categories'}
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
                className="form-control"
                placeholder="Search for products..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <button className="search-button" onClick={onClearFilter}>Clear Filter</button>
        </div>
    );
};

export default SearchBar;