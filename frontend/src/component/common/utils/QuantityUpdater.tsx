import { BsDash, BsPlus } from "react-icons/bs";

interface QuantityUpdaterProps {
    quantity: number;
    increment: () => void;
    decrement: () => void;
}

const QuantityUpdater = (p: QuantityUpdaterProps) => {
    const { increment, decrement, quantity } = p;
    return (
        <section style={{ width: "150px" }}>
            <div className="input-group">
                <button onClick={decrement} className="btn btn-outline-secondary">
                    <BsDash />
                </button>
                <input
                    name="quantity"
                    readOnly
                    type="number"
                    value={quantity}
                    className="form-control text-center"
                />
                <button onClick={increment} className="btn btn-outline-secondary">
                    <BsPlus />
                </button>
            </div>
        </section>
    );
};

export default QuantityUpdater;