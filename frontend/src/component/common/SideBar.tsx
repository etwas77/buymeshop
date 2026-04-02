import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store/store";
import { getAllBrands, ProductState, toggleBrand } from "../../store/features/productSlice";
import React from "react";
import _ from "lodash";


const SideBar = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { brands, selectedBrands } = useSelector((state: { products: ProductState }) => state.products);

    React.useEffect(() => {
        dispatch(getAllBrands());
    }, [dispatch]);

    return <div>Filter by Brands
        {_.map(brands, (brand, index) => (
            <div key={index} className="brand-item">
                <label className="checkbox-container">
                    <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => {
                            dispatch(toggleBrand(brand));
                        }}
                    />
                    <span className="checkmark"></span>
                    {brand}
                </label>
            </div>
        ))}

    </div>;
};

export default SideBar;