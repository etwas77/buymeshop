import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchByImage, SearchState, setImageSearch } from "../../store/features/searchSlice";
import { AppDispatch } from "../../store/store";

const ImageSearch = () => {
    const [imageFile, setImageFile] = React.useState<File>();
    const [imagePreview, setImagePreview] = React.useState<string>();
    const fileRef = React.useRef<HTMLInputElement>(null);
    const { imageSearch, searchInProgress } = useSelector((state: { search: SearchState }) => state.search);

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
        fileRef.current?.click();
    };

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!imageFile) {
            return;
        }

        if (imageFile) {            
            await dispatch(searchByImage(imageFile));
        }
    };

    return (
        <div className="image-search-container" >
            <form onSubmit={handleSearch}>
                <div className="image-uploader"
                    onClick={handleClickUpload}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="image-preview" />
                    ) : (
                        <div className="upload-placeholder">
                            <p>Search by Image, Drag & Drop or Select</p>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    style={{ display: "none" }}
                    onChange={hadleImageUpload}
                />
                <div className="mt-2 mb-3">
                    <button type="submit" className="image-search-button" disabled={!imageFile || searchInProgress}>
                        {searchInProgress ? "Searching..." : "Search"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ImageSearch;
