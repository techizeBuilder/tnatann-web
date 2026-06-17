import { useDropzone } from "react-dropzone";
import { HiOutlineUpload } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import { toast } from "sonner";
import { t } from "@/utils";
import CustomImage from "@/components/Common/CustomImage";
import { Badge } from "@/components/ui/badge";
import { MAX_IMAGE_LIMIT } from "@/lib/constants";
import { memo, useCallback, useMemo } from "react";

const ImageCard = memo(({ fileObj, index, onRemove }) => (
  <div className="relative">
    <CustomImage
      width={591}
      height={350}
      className="rounded-2xl object-cover aspect-591/350 w-full"
      src={fileObj.preview}
      alt={fileObj.file.name}
    />
    <div className="absolute top-0 p-2 flex items-center gap-2 justify-between text-white w-full">
      <div className="flex gap-2 items-center">
        <button
          className="bg-white p-1 rounded-full"
          onClick={() => onRemove(index)}
        >
          <MdClose size={22} color="black" />
        </button>
        <div className="text-white text-xs flex flex-col [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]">
          <span>{fileObj.file.name}</span>
          <span>{Math.round(fileObj.file.size / 1024)} KB</span>
        </div>
      </div>
      {index === 0 && (
        <Badge className="bg-primary text-white">{t("primary")}</Badge>
      )}
    </div>
  </div>
));


const ImageUpload = ({
  otherImages,
  setOtherImages,
  setStep,
  handleGoBack,
}) => {

  // ✅ Stable reference
  const onOtherDrop = useCallback((acceptedFiles) => {
    const currentFilesCount = otherImages.length;
    const remainingSlots = MAX_IMAGE_LIMIT - currentFilesCount;

    if (remainingSlots === 0) {
      toast.error(t("imageLimitExceeded"));
      return;
    }

    if (acceptedFiles.length > remainingSlots) {
      toast.error(t("youCanUpload") + " " + remainingSlots + " " + t("moreImages"));
      return;
    }

    const newImagesWithPreviews = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setOtherImages((prevImages) => [...prevImages, ...newImagesWithPreviews]);
  }, [otherImages.length]); // ✅ only re-creates when count changes

  const {
    getRootProps: getRootOtheProps,
    getInputProps: getInputOtherProps,
    isDragActive: isDragOtherActive,
  } = useDropzone({
    onDrop: onOtherDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    multiple: true,
  });

  const removeOtherImage = useCallback((index) => {
    setOtherImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const filesOther = useMemo(() =>
    otherImages.map((fileObj, index) => (
      <ImageCard
        key={`${fileObj.file.name}-${fileObj.file.size}-${index}`}
        fileObj={fileObj}
        index={index}
        onRemove={removeOtherImage}
      />
    )),
    [otherImages, removeOtherImage]);

  return (
    <div className="flex flex-col gap-8">
      <div className="border-2 border-dashed rounded-lg p-2">
        <div
          {...getRootOtheProps()}
          className="flex flex-col items-center justify-center min-h-[175px] cursor-pointer"
          style={{ display: otherImages.length >= MAX_IMAGE_LIMIT ? "none" : "" }}
        >
          <input {...getInputOtherProps()} />
          {isDragOtherActive ? (
            <span className="text-primary font-medium">
              {t("dropFiles")}
            </span>
          ) : (
            <div className="flex flex-col gap-2 items-center text-center">
              <span className="text-muted-foreground">
                {t("dragFiles")}
              </span>
              <span className="text-muted-foreground">{t("or")}</span>
              <div className="flex items-center text-primary">
                <HiOutlineUpload size={24} />
                <span className="font-medium">{t("upload")}</span>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{filesOther}</div>
      </div>
      <div className="flex justify-end gap-3">
        <button
          className="bg-black text-white px-4 py-2 rounded-md text-xl font-light"
          onClick={handleGoBack}
        >
          {t("back")}
        </button>
        <button
          className="bg-primary text-white  px-4 py-2 rounded-md text-xl font-light"
          onClick={() => setStep(6)}
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;
