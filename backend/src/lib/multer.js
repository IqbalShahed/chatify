import multer from "multer";

const storage = multer.memoryStorage();
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const imageFileFilter = (_, file, cb) => {
    if (file.mimetype?.startsWith("image/")) {
        cb(null, true);
        return;
    }
    cb(new Error("Only image files are allowed"));
};

export const upload = multer({
    storage,
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
    fileFilter: imageFileFilter,
});
