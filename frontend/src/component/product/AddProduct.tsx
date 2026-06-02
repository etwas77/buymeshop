import { Step, StepLabel, Stepper } from "@mui/material";
import _ from "lodash";
import React from "react";
import { BsDash, BsTrash } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { AddProductRequestDto } from "../../dtos/AddProductRequestDto";
import { CategoryDto } from "../../dtos/CategoryDto";
import { addNewProduct, deleteProductById, getProductById, ProductState, removeImageByIdProductById, unsetProduct, updateProductById } from "../../store/features/productSlice";
import { AppDispatch } from "../../store/store";
import BrandSelector from "../common/BrandSelector";
import CategorySelector from "../common/CategorySelector";
import ImageUploader from "../common/ImageUploader";
import ImageZoomify from "../common/ImageZoomify";

export interface AddProductProps {
    productId?: string;
}

const AddProduct = (p: AddProductProps) => {
    const { productId } = p;
    const dispatch = useDispatch<AppDispatch>();
    const { product } = useSelector((state: { products: ProductState }) => state.products);
    const [brand, setBrand] = React.useState<string>();
    const [category, setCategory] = React.useState<CategoryDto>();
    const [activeStep, setActiveStep] = React.useState<number>(0);

    const steps = ["Add/Edit Product", "Upload product images", "Done"];

    const [name, setName] = React.useState<string>("");
    const [price, setPrice] = React.useState<string>("");
    const [inventory, setInventory] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");

    const handleAddNewProduct = React.useCallback((event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        const parsedPrice = Number(price);
        const parsedInventory = Number(inventory);

        if (!brand || !category || !name || !description || !Number.isFinite(parsedPrice) || parsedPrice <= 0 || !Number.isFinite(parsedInventory) || parsedInventory <= 0) {
            console.log("fill in all values first");
            return;
        }

        const req: AddProductRequestDto = {
            name,
            brand,
            price: parsedPrice,
            inventory: parsedInventory,
            description,
            category,
        };

        if (product === undefined)
            dispatch(addNewProduct(req));
        else
            dispatch(updateProductById({ productUpdateRequest: req, id: product.id }));
    }, [brand, category, dispatch, name, price, inventory, description, product]);

    const deleteImage = React.useCallback((imageId: string) => () => {
        dispatch(removeImageByIdProductById({ imageId, productId: productId! }));
    }, [dispatch, productId]);

    React.useEffect(() => {
        if (product) {
            setName(product.name);
            setPrice(product.price.toString());
            setInventory(product.inventory.toString());
            setDescription(product.description);
            setCategory(product.category);
            setBrand(product.brand);
            setActiveStep(product.images && product.images.length > 0 ? 2 : 1);
        }
    }, [product]);

    React.useEffect(() => {
        if (productId) {
            dispatch(getProductById(productId));
        }
        else {
            dispatch(unsetProduct());
            setName("");
            setPrice("");
            setInventory("");
            setDescription("");
            setCategory(undefined);
            setBrand(undefined);
            setActiveStep(0);
        }
    }, [productId]);

    const deleteProduct = React.useCallback(() => {
        if (productId) {
            dispatch(deleteProductById(productId));
        }
    }, [dispatch, productId, name, brand, price, inventory, description, category]);

    return (
        <div>
            <section className="container mt-5 mb-5">
                <div className="d-flex justify-content-center">
                    <div className="col-md-6 col-xs-12">
                        <h4>{product === undefined ? "Add New Product" : "Edit Product"}</h4>
                        <Stepper activeStep={activeStep} className="mb-4">
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>


                        <div>
                            <form onSubmit={handleAddNewProduct} >
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

                                {_.map(product?.images, image => {
                                    return (
                                        <div key={image.id} className="mt-4 d-flex align-items-center gap-2">
                                            <div className="image-container flex-shrink-0">
                                                <ImageZoomify imageId={image.id} />
                                            </div>
                                            <button type="button" className="btn btn-sm btn-danger" onClick={deleteImage(image.id)}><BsDash /></button>
                                        </div>
                                    );
                                })}

                                {product &&
                                    <div className="container">
                                        <ImageUploader productId={product?.id} />
                                    </div>
                                }
                                <button type="submit" className="btn btn-secondary btn-sm">{"Submit"}</button>
                                <button type="button" className="btn btn-outline-danger btn-sm" onClick={deleteProduct}><BsTrash />{"Delete"}</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

        </div >
    );
};

export default AddProduct;