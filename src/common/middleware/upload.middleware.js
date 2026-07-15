import multer from "multer";
import path from "path";
import fs from "fs";

const createUploader = (folderName) => {

    const uploadPath = `uploads/${folderName}`;

    if (!fs.existsSync(uploadPath)) {

        fs.mkdirSync(uploadPath, {
            recursive: true
        });

    }

    const storage = multer.diskStorage({

        destination(req, file, cb) {

            cb(null, uploadPath);

        },

        filename(req, file, cb) {

            const ext = path.extname(file.originalname);

            cb(
                null,
                Date.now() + ext
            );

        }

    });

    const fileFilter = (req, file, cb) => {

        if (file.mimetype.startsWith("image/")) {

            cb(null, true);

        }

        else {

            cb(
                new Error("Only Images Allowed"),
                false
            );

        }

    };

    return multer({

        storage,
        fileFilter

    });

};

export const categoryUpload = createUploader("categories");

export const brandUpload = createUploader("brands");

export const productUpload = createUploader("products");