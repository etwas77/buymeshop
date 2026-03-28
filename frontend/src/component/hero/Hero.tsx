import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery } from "../../store/features/searchSlice";
import SearchBar from "../search/SearchBar";
import HeroSlider from "./HeroSlider";


const Hero = () => {
    const [currentSlide,] = React.useState<number>(2);
    const dispatch = useDispatch();
    const { searchQuery } = useSelector((state: any) => state.search);


    const onChange = React.useMemo(() => (value: string) => {
        dispatch(setSearchQuery(value));
    }, [dispatch]);

    return (
        <div className="hero">
            <HeroSlider currentSlide={currentSlide} />
            <div className="hero-content">
                <h1>Welcome to <span className="text-primary">BuyMeShop-le</span></h1>
                <SearchBar value={searchQuery} onChange={onChange} onClear={() => dispatch(setSearchQuery(''))} />
                <div className="home-button-container">
                    <a href="#shop" className="home-shop-button link">Shop Now</a>
                    <button className="deals-button">today's deal</button>
                </div>
            </div>
        </div>

    );
};

export default Hero;