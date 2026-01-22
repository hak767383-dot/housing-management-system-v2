import { API_BASE_URL } from "@/const";
import { useState } from "react";

/**
 * Hook for handling file uploads on client side
 * Provides validation and upload functionality
 */
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Validate file before upload
   * Returns { isValid: boolean, message: string }
   */
  const validateBeforeUpload = async (
    file: File
  ): Promise<{ isValid: boolean; message: string }> => {
    if (!file) {
      return {
        isValid: false,
        message: "الملف مفقود",
      };
    }

    // Basic client-side validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (file.size > maxSize) {
      return {
        isValid: false,
        message: "حجم الملف يتجاوز الحد الأقصى (5MB)",
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: "نوع الملف غير مدعوم. يرجى رفع PDF أو صورة",
      };
    }

    return {
      isValid: true,
      message: "",
    };
  };

  /**
   * Upload receipt file
   */
  const uploadFile = async (file: File) => {
    if (!file) {
      throw new Error("الملف مفقود");
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      formData.append('mimeType', file.type);
      formData.append('fileSize', file.size.toString());

      const response = await fetch(`${API_BASE_URL}/files/upload-receipt`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل رفع الملف');
      }

      return await response.json();
    } finally {
      setIsUploading(false);
    }
  };

  return {
    validateBeforeUpload,
    uploadFile,
    isUploading,
  };
};
