import React from "react";
import { api } from "../../services/api";

interface ProductImageProps {
    imageId: string;
}

const ProductImage = (p: ProductImageProps) => {
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
        <div className="image-container">
            {productImage && <img src={productImage} alt="Product" />}
        </div>
    );
};

export default ProductImage;