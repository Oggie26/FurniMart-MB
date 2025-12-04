export const uploadToCloudinary = async (imageUri) => {
    try {
        const CLOUDINARY_UPLOAD_PRESET = "FurniMart";
        const CLOUDINARY_CLOUD_NAME = "dtrmzaceb";

        const formData = new FormData();

        if (imageUri.startsWith("data:")) {
            // It's a Base64 Data URI (e.g. from signature canvas)
            // Cloudinary supports uploading data URIs directly as string
            formData.append("file", imageUri);
        } else {
            // It's a File URI (e.g. from ImagePicker)
            // For React Native, we need to format the file object properly
            const uriParts = imageUri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            formData.append("file", {
                uri: imageUri,
                type: `image/${fileType}`,
                name: `photo_${Date.now()}.${fileType}`,
            });
        }

        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        return data.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload image to Cloudinary");
    }
};

// Alias for backward compatibility
export const uploadImageToCloudinary = uploadToCloudinary;