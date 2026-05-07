import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCategory, CategoryState, getAllCategories } from "../../store/features/categorySlice";
import { AppDispatch } from "../../store/store";
import { CategoryDto } from "../../dtos/CategoryDto";

export interface CategorySelectorProps {
    category?: CategoryDto;
    onCategorySelect: (category?: CategoryDto) => void;
}

const CategorySelector = (p: CategorySelectorProps) => {
    const { category, onCategorySelect } = p;
    const { categories } = useSelector((state: { category: CategoryState }) => state.category);
    const dispatch = useDispatch<AppDispatch>();

    const [newCategory, setNewCategory] = React.useState<CategoryDto>();
    const [showNewCategoryInput, setShowNewCategoryInput] = React.useState<boolean>(false);

    React.useEffect(() => {
        dispatch(getAllCategories());
    }, [dispatch]);

    const handleAddCategory = () => {
        const ncategory = newCategory;
        dispatch(addCategory(ncategory));
        onCategorySelect(ncategory);
        setNewCategory({ id: "", name: "" });
        setShowNewCategoryInput(false);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        if (category === "New") {
            setShowNewCategoryInput(true);
        } else {
            const selectedCategory = categories.find(cat => cat.name === category);
            onCategorySelect(selectedCategory);
        }
    }

    return (
        <div>
            <label className="form-label">categories:</label>
            <select
                value={category?.name ?? ''}
                onChange={handleCategoryChange}
                className="form-select"
            >
                <option value="">Select a category</option>
                {_.map(categories, (category, idx) => (
                    <option key={idx} value={category.name}>{category.name}</option>
                ))}
                <option key="new" value="New">add new category</option>
            </select>

            {showNewCategoryInput && (
                <div className="input-group">
                    <label className="form-label">Add new category</label>
                    <input
                        type="text"
                        value={newCategory?.name ?? ''}
                        onChange={(e) => setNewCategory({ id: "", name: e.target.value })}
                        className="form-control"
                    />
                    <button className="btn btn-primary" onClick={handleAddCategory}>Add category to selection</button>
                    <button className="btn btn-secondary" onClick={() => setShowNewCategoryInput(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default CategorySelector;