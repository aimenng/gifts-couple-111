// Image upload utilities
export interface ImageValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
}

/**
 * Validate file type
 */
export function validateFileType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
}

/**
 * Validate multiple files for batch upload
 */
export function validateFiles(files: FileList | File[], maxCount: number = 100, maxSizeMB: number = 5): ImageValidationResult {
    const errors: string[] = [];
    const fileArray = Array.from(files);

    if (fileArray.length > maxCount) {
        errors.push(`最多只能上传 ${maxCount} 张照片`);
    }

    fileArray.forEach((file, index) => {
        if (!validateFileType(file)) {
            errors.push(`文件 ${index + 1} (${file.name}) 格式不支持`);
        }
        if (!validateFileSize(file, maxSizeMB)) {
            errors.push(`文件 ${index + 1} (${file.name}) 超过 ${maxSizeMB}MB 限制`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Compress image to target size
 */
export async function compressImage(file: File, maxSizeMB: number = 5): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate max dimensions to keep under size limit
                const maxPixels = 2000;
                if (width > maxPixels || height > maxPixels) {
                    if (width > height) {
                        height = (height / width) * maxPixels;
                        width = maxPixels;
                    } else {
                        width = (width / height) * maxPixels;
                        height = maxPixels;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to compress image'));
                        return;
                    }

                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });

                    resolve(compressedFile);
                }, 'image/jpeg', 0.85);
            };

            img.onerror = () => reject(new Error('Failed to load image'));
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
    });
}

/**
 * Convert file to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

/**
 * Convert base64 to File
 */
export function base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}
