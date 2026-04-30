import { BsDash, BsPlus } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { decrementQuantity, incrementQuantity, ProductState } from "../../../store/features/productSlice";
import { AppDispatch } from "../../../store/store";

const QuantityUpdater = () => {
    const { quantity} = useSelector((state: { products: ProductState }) => state.products);
    const dispatch = useDispatch<AppDispatch>();
    
    return (
        <section style={{width: "150px"}}>
            <div className="input-group">   
                <button onClick={() => dispatch(decrementQuantity())} className="btn btn-outline-secondary">
                    <BsDash />               
                </button>
                <input
                    name="quantity"
                    readOnly
                    type="number"
                    value={quantity}
                    className="form-control text-center"
                />
                <button onClick={() => dispatch(incrementQuantity())} className="btn btn-outline-secondary">        
                    <BsPlus />
                </button>
            </div>
        </section>
    );
};

export default QuantityUpdater;