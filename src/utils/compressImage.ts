/**
 * Compresses an image by re-encoding it as a JPEG via an offscreen canvas.
 *
 * @param blobImg The source image file to compress.
 * @param percent JPEG quality as a percentage (0–100); higher means better quality and larger output.
 * @returns A promise resolving to a JPEG `File` of the compressed image.
 *
 * @see https://stackoverflow.com/a/73744343
 */
export async function compressImage(blobImg: File, percent: number): Promise<File> {
  const bitmap = await createImageBitmap(blobImg);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  ctx?.drawImage(bitmap, 0, 0);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", percent / 100)
  );
  if (!blob) throw new Error("Could not compress image");

  const name = blobImg.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}
