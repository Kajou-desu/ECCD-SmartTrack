import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { PrimaryButton } from "@components/ui/Button.jsx";

export default function UploadPhotos({ disabled = false, onUpload }) {
  const fileInputRef = useRef(null);

  const handleChoosePhotos = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChange = (event) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      onUpload(files);
    }

    event.target.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
        className="sr-only"
      />

      <PrimaryButton
        type="button"
        disabled={disabled}
        icon={<ImagePlus className="h-5 w-5" />}
        label="Upload Photos"
        onClick={handleChoosePhotos}
      />
    </>
  );
}
