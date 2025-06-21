import { API_BASE_URL } from '../config/api';

export const formatImageUrl = (imagePath, fallback = '/images/placeholder-food.jpg') => {
  try {
    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Clean the path
    const cleanPath = imagePath.replace(/^\/+/, '');

    // Check if it already includes uploads in the path
    if (cleanPath.includes('uploads')) {
      return `${API_BASE_URL}/${cleanPath}`;
    }

    // Default to uploads folder
    return `${API_BASE_URL}/uploads/${cleanPath}`;

  } catch (error) {
    console.error('Error formatting image URL:', error);
    return fallback;
  }
};

export default formatImageUrl;