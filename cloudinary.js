const CLOUD_NAME = "rmt792pr";
const UPLOAD_PRESET = "chatlive";

export async function uploadToCloudinary(file) {

  const url =
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(url, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error("Photo URL नहीं मिली");
  }

  return data.secure_url;
}