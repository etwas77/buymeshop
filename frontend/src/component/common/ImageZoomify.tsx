import React from "react";
import ImageZoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { api } from "../services/api";

export interface ImageZoomProps {
    imageId: string;
}

const ImageZoomify = (p: ImageZoomProps) => {
    const { imageId } = p;
    const [productImage, setProductImage] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchProductImage = async (imageId: string) => {
            try {
                const response = await api.get("/images/image/download/" + imageId, { responseType: "blob" });
                const blob = response.data;
                const reader = new FileReader();
                reader.onloadend = () => {
                    setProductImage(reader.result as string);
                }
                reader.readAsDataURL(blob);
            }
            catch (error) {
                console.error("Error fetching product image:", error);
            }
        };
        fetchProductImage(imageId);
    }, [imageId]);

    return (
        <ImageZoom>
            <img src={productImage ?? undefined} alt="Product" className="resized-image" />
        </ImageZoom>
    );
};

export default ImageZoomify;