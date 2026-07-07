import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import _ from "lodash";
import bg1 from "../../assets/images/Audi_80_b4.jpg";
import bg2 from "../../assets/images/aum.jpg";
import bg3 from "../../assets/images/oum1.png";

const images = [bg1, bg2, bg3];

export interface HeroSliderProps {
    currentSlide?: number;
};

const HeroSlider = (p: HeroSliderProps) => {
    const { currentSlide } = p;

    const settings = {
        infinite: true,
        speed: 12000,
        autoplay: true,
        autoplaySpeed: 15000,
    }
    return (
        <Slider {...settings} className="hero-slider" initialSlide={currentSlide} >
            {_.map(images, (image, index) => (
                <div key={index} className='slide'>
                    <img src={image} alt={`Slide ${index + 1}`} className='slide-image' />
                </div>
            ))}
        </Slider>
    );
};

export default HeroSlider;