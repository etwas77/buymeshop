import _ from "lodash";
import { nanoid } from "nanoid";
import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { uploadImages } from "../../store/features/imageSlice";

const useAppDispatch = useDispatch.withTypes<AppDispatch>();

interface ImagePreview {
    id: string;
    file: File;
    preview: string;
}
interface ImageUploaderProps {
    productId?: string;
}

const ImageUploader = (p: ImageUploaderProps) => {
    const { productId } = p;
    const [images, setImages] = React.useState<ImagePreview[]>([]);
    const dispatch = useAppDispatch();

    console.log('images', images);


    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const imagePreviews: ImagePreview[] = _.map(Array.from(event.target.files), (file) => ({
                id: nanoid(),
                file,
                preview: URL.createObjectURL(file)
            }));
            //setImages((prev) => [...prev, ...imagePreviews]);
            setImages(imagePreviews);
        }
    };

    const handleUpload: React.MouseEventHandler<HTMLButtonElement> = async () => {
        if (!productId) {
            return;
        }
        if (images.length > 0) {
            dispatch(uploadImages({ files: images.map(img => img.file), productId }));
            setImages([]);
        };
    }

    return (
        <div className="mt-4">
            <h5>Upload product image/s</h5>
            <div className="d-flex align-items-center mb-2 input-group">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-control me-2"

                />
                <button
                    type="button"
                    onClick={handleUpload}
                    className={images.length === 0 ? "btn btn-secondary btn-sm" : "btn btn-sm btn-primary"}
                    disabled={images.length === 0}>
                    {images.length === 0 ? "Select Images" : "Upload Images"}
                </button>
            </div>
        </div>
    );
};

export default ImageUploader;

