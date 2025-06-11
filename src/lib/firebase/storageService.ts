
'use server'; // Can be used by server actions, but also callable from client if needed and rules permit

import { storage } from './client';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Uploads a profile image for a user.
 * @param userId The ID of the user.
 * @param file The image file to upload.
 * @param previousPhotoURL Optional. If provided, the old profile image will be deleted after new one uploads.
 * @returns A promise that resolves with the download URL of the uploaded image.
 */
export async function uploadProfileImage(
  userId: string,
  file: File,
  previousPhotoURL?: string | null
): Promise<string> {
  if (!userId) throw new Error('User ID is required for uploading profile image.');
  if (!file) throw new Error('File is required for uploading profile image.');
  if (!file.type.startsWith('image/')) throw new Error('File must be an image.');

  const filePath = `profileImages/${userId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, filePath);

  try {
    // If a previous photo URL exists and it's a Firebase Storage URL, try to delete the old file.
    if (previousPhotoURL && previousPhotoURL.includes('firebasestorage.googleapis.com')) {
      try {
        const oldFileRef = ref(storage, previousPhotoURL);
        await deleteObject(oldFileRef);
      } catch (deleteError: any) {
        // Log deletion error but don't block new upload if deletion fails (e.g., file already deleted or permissions)
        console.warn("Failed to delete previous profile image, it might not exist or rules changed:", deleteError.code, deleteError.message);
      }
    }

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image to Firebase Storage:', error);
    throw error; // Re-throw to be handled by the caller
  }
}
