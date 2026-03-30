import React from "react";
import SearchBar from "../search/SearchBar";
import HeroSlider from "./HeroSlider";


const Hero = () => {
    const [currentSlide,] = React.useState<number>(2);

    return (
        <div className="hero">
            <HeroSlider currentSlide={currentSlide} />
            <div className="hero-content">
                <h1>Welcome to <span className="text-primary">BuyMeShop-le</span></h1>
                <SearchBar />
                <div className="home-button-container">
                    <a href="#shop" className="home-shop-button link">Shop Now</a>
                    <button className="deals-button">today's deal</button>
                </div>
            </div>
        </div>

    );
};

export default Hero;