import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../component/services/api";
import { ImageDto } from "../../dtos/ImageDto";

export const uploadImages = createAsyncThunk(
    "image/uploadImages",
    async (payload: { files: File[]; productId: string }) => {
        const formData = new FormData();
        formData.append("productId", payload.productId);
        payload.files.forEach(file => {
            formData.append("files", file);
        });

        try {
            const response = await api.post("/images/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: false
            });
            return response.data as ImageDto[];
        }
        catch (error: any) {
            return undefined;
        }
    }
);

export const deleteImage = createAsyncThunk(
    "image/deleteProductImage",
    async (payload: { imageId: string }) => {
        try {
            await api.delete(`/images/delete/${payload.imageId}/delete`);
            return payload.imageId;
        }
        catch (error: any) {
            return undefined;
        }
    }
);

export interface ImageState {
    images?: ImageDto[];
    isUploading: boolean;
}

const imageSlice = createSlice({
    name: "image",
    initialState: {
        isUploading: false,
    } as ImageState,
    reducers: {
    },
    extraReducers: (builder) => {builder
        .addCase(uploadImages.fulfilled, (state, action) => {
            state.images = action.payload;
            state.isUploading = false;
        })
        .addCase(uploadImages.pending, (state) => {
            state.isUploading = true;
        })
        .addCase(uploadImages.rejected, (state) => {
            state.isUploading = false;
        })
        .addCase(deleteImage.fulfilled, (state, action) => {
            if (state.images) {
                state.images = state.images.filter(image => image.id !== action.payload);
            }
        })
    }

});

export const { } = imageSlice.actions;
export default imageSlice.reducer;