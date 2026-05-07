import { useDispatch, useSelector } from "react-redux";
import { addBrand, getAllBrands, ProductState } from "../../store/features/productSlice";
import { AppDispatch } from "../../store/store";
import React from "react";
import _ from "lodash";

export interface BrandSelectorProps {
    selectedBrand: string;
    onBrandSelect: (brand: string) => void;
}

const BrandSelector = (p: BrandSelectorProps) => {
    const { selectedBrand, onBrandSelect } = p;

    const { brands } = useSelector((state: { products: ProductState }) => state.products);
    const dispatch = useDispatch<AppDispatch>();

    const [newBrand, setNewBrand] = React.useState<string>("");
    const [showNewBrandInput, setShowNewBrandInput] = React.useState<boolean>(false);

    React.useEffect(() => {
        dispatch(getAllBrands());
    }, [dispatch]);

    const handleAddBrand = () => {
        const nbrand = newBrand;
        dispatch(addBrand(nbrand));
        onBrandSelect(nbrand);
        setNewBrand("");
        setShowNewBrandInput(false);
    };

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const brand = e.target.value;
        if (brand === "New") {
            setShowNewBrandInput(true);
        } else {
            onBrandSelect(brand);
        }
    }

    return (
        <div>
            <label className="form-label">brands:</label>
            <select
                value={selectedBrand}
                onChange={handleBranchChange}
                className="form-select"
            >
                <option value="">Select a brand</option>
                {_.map(brands, (brand, idx) => (
                    <option key={idx} value={brand.toString()}>{brand}</option>
                ))}
                <option key="new" value="New">add new brand</option>
            </select>

            {showNewBrandInput && (
                <div className="input-group">
                    <label className="form-label">Add new brand</label>
                    <input type="text" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} className="form-control" />
                    <button className="btn btn-primary" onClick={handleAddBrand}>Add brand to selection</button>
                    <button className="btn btn-secondary" onClick={() => setShowNewBrandInput(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default BrandSelector;