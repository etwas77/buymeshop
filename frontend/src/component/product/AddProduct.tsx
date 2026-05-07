import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AddProductRequestDto } from "../../dtos/AddProductRequestDto";
import { CategoryDto } from "../../dtos/CategoryDto";
import { addNewProduct, ProductState } from "../../store/features/productSlice";
import { AppDispatch } from "../../store/store";
import BrandSelector from "../common/BrandSelector";
import CategorySelector from "../common/CategorySelector";


const AddProduct = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { product } = useSelector((state: { products: ProductState }) => state.products);
    const [brand, setBrand] = React.useState<string>();
    const [category, setCategory] = React.useState<CategoryDto>();

    const [name, setName] = React.useState<string>();
    const [price, setPrice] = React.useState<string>();
    const [inventory, setInventory] = React.useState<string>();
    const [description, setDescription] = React.useState<string>();

    const handleAddNewProduct = React.useCallback((event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!brand || !category || !name || !price || !inventory || !description) {
            console.log("fill in all values first");  
            return;
        }

        const req: AddProductRequestDto = {
            name,
            brand,
            price: Number(price),
            inventory: Number(inventory),
            description,
            category
        };
        dispatch(addNewProduct(req));
    }, [brand, category, dispatch, name, price, inventory, description]);

    return (
        <div>
            <section className="container mt-5 mb-5">
                <div className="d-flex justify-content-center">
                    <div className="col-md-6 col-xs-12">
                        <h4>add new product</h4>
                        <div>
                            <form onSubmit={handleAddNewProduct}>
                                <div className="mb-3">
                                    <label className="form-label">name</label>
                                    <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label"> {Number(price) > 0 ? "Price" : "Price must be a number greater than 0"}</label>
                                    <input type="text" className="form-control" value={price} onChange={e => setPrice(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label"> {Number(inventory) > 0 ? "Inventory" : "Inventory must be a number greater than 0"}</label>
                                    <input type="text" className="form-control" value={inventory} onChange={e => setInventory(e.target.value)} required />
                                </div>

                                <div className="mb-3">
                                    <BrandSelector
                                        selectedBrand={brand ?? ""}
                                        onBrandSelect={(v: string) => { setBrand(v); }}
                                    />
                                </div>

                                <div className="mb-3">
                                    <CategorySelector
                                        category={category}
                                        onCategorySelect={(v?: CategoryDto) => { setCategory(v); }}
                                    />
                                </div>



                                <div className="mb-3">
                                    <label className="form-label" >Description</label>
                                    <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} required />
                                </div>

                                <button type="submit" className="btn btn-secondary btn-sm">Submit</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

        </div >
    );
};

export default AddProduct;