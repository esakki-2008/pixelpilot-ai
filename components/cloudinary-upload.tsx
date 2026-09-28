"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Upload } from "lucide-react";

type UploadInfo = {
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  format?: string;
  width?: number;
  height?: number;
};

export default function CloudinaryUpload({ onUploaded }: { onUploaded?: (asset: UploadInfo) => void }) {
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!preset) return <div className="upload-config-warning">Add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.local</div>;

  return (
    <CldUploadWidget
      uploadPreset={preset}
      options={{
        sources: ["local", "url", "camera"],
        multiple: true,
        maxFiles: 10,
        maxFileSize: 10000000,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif", "mp4", "mov"],
        folder: "pixelpilot",
      }}
      onSuccess={(result) => {
        const info = result.info as UploadInfo;
        if (info) onUploaded?.(info);
      }}
    >
      {({ open }) => (
        <button className="primary" onClick={() => open()}>
          <Upload size={17} /> Upload to Cloudinary
        </button>
      )}
    </CldUploadWidget>
  );
}
