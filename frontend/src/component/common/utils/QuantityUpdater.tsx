import React from "react";
import { BsDash, BsPlus } from "react-icons/bs";

export interface QuantityUpdaterProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
}

const QuantityUpdater = (p: QuantityUpdaterProps) => {
    const { quantity, onIncrease, onDecrease } = p;
    return (
        <section style={{width: "150px"}}>
            <div className="input-group">
                <button onClick={onDecrease} className="btn btn-outline-secondary">
                    {React.createElement(BsDash as React.ComponentType)}               
                </button>
                <input
                    name="quantity"
                    readOnly
                    type="number"
                    value={quantity}
                    className="form-control text-center"
                />
                <button onClick={onIncrease} className="btn btn-outline-secondary">        
                    {React.createElement(BsPlus as React.ComponentType)}
                </button>
            </div>
        </section>
    );
};

export default QuantityUpdater;