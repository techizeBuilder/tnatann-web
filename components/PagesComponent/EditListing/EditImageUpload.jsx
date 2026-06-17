import { memo, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { HiOutlineUpload } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import { t } from "@/utils";
import CustomImage from "@/components/Common/CustomImage";
import { toast } from "sonner";
import { MAX_IMAGE_LIMIT } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const ImageCard = memo(({ file, index, onRemove, t }) => (
  <div className="relative">
    <CustomImage
      width={591}
      height={350}
      className="rounded-2xl object-cover aspect-591/350 w-full"
      src={file.image ? file.image : file.preview}
      alt={index}
    />
    <div className="absolute top-2 left-2 flex gap-2 items-center">
      {/* 2. Add the actual close button back here */}
      <button
        className="bg-white p-1 rounded-full"
        onClick={() => onRemove(index, file)}
      >
        <MdClose size={14} color="black" />
      </button>
      {file.file?.name && (
        <div className="text-white text-xs flex flex-col [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]">
          <span>{file.file.name}</span>
          <span>{Math.round(file.file.size / 1024)} KB</span>
        </div>
      )}
    </div>
    {index === 0 && (
      <Badge className="absolute top-2 right-2 bg-primary text-white">
        {t("primary")}
      </Badge>
    )}
  </div>
));

const EditComponentThree = ({
  OtherImages,
  setOtherImages,
  handleImageSubmit,
  handleGoBack,
  setDeleteImagesId,
}) => {

  const onOtherDrop = useCallback(
    (acceptedFiles) => {
      const currentFilesCount = OtherImages.length; // Number of files already uploaded
      const remainingSlots = MAX_IMAGE_LIMIT - currentFilesCount; // How many more files can be uploaded

      if (remainingSlots === 0) {
        // Show error if the limit has been reached
        toast.error(t("imageLimitExceeded"));
        return;
      }

      if (acceptedFiles.length > remainingSlots) {
        // Show error if the number of new files exceeds the remaining slots
        toast.error(
          t("youCanUpload") + " " + remainingSlots + " " + t("moreImages")
        );
        return;
      }

      const newImagesWithPreviews = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file), // Generate ONCE here
      }));

      // Add the new files to the state
      setOtherImages((prevImages) => [...prevImages, ...newImagesWithPreviews]);
    },
    [OtherImages]
  );

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

  const removeOtherImage = useCallback((index, file) => {
    setOtherImages((prev) => prev.filter((_, i) => i !== index));

    if (file?.id) {
      setDeleteImagesId((prevIds) => [...prevIds, file.id]);
    }
  }, []);

  const filesOther = useMemo(
    () =>
      OtherImages &&
      OtherImages?.map((file, index) => (
        <ImageCard
          key={file.id || `${file?.file?.name}-${index}`}
          file={file}
          index={index}
          onRemove={removeOtherImage}
          t={t}
        />
      )),
    [OtherImages, removeOtherImage]
  );
  return (
    <div className="flex flex-col gap-8">
      <div className="border-2 border-dashed rounded-lg p-2">
        <div
          {...getRootOtheProps()}
          className="flex flex-col items-center justify-center min-h-[175px] cursor-pointer"
          style={{ display: OtherImages.length >= MAX_IMAGE_LIMIT ? "none" : "" }}
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
              <div className="flex items-center gap-2 text-primary">
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
          onClick={handleImageSubmit}
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
};

export default EditComponentThree;