import React from "react";
import { AppDispatch } from "../../store/store";
import { useDispatch } from "react-redux";
import { setImageSearch, searchByImage } from "../../store/features/searchSlice";

const ImageSearch = () => {
    const [imageFile, setImageFile] = React.useState<File>();
    const [imagePreview, setImagePreview] = React.useState<string>();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [fileRef, setFileRef] = React.useState<HTMLInputElement>();

    const dispatch = useDispatch<AppDispatch>();

    const hadleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            dispatch(setImageSearch(file.name));
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            dispatch(setImageSearch(file.name));
        }
    };

    const handleClickUpload = () => {
        fileRef?.click();
    };

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!imageFile) {
            return;
        }

        if (imageFile) {
            setIsLoading(true);
            try {
                const x = await dispatch(searchByImage(imageFile)).unwrap();

            } catch (error) {
                console.error("Error searching with image:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div></div>
    );
};

export default ImageSearch;
