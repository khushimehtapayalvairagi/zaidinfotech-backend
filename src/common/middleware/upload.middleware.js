import multer from "multer";
import path from "path";
import fs from "fs";

// =====================================================
// CREATE UPLOADER
// =====================================================

const createUploader = (folderName, options = {}) => {

    const uploadPath = path.join(
        process.cwd(),
        "uploads",
        folderName
    );

    // =================================================
    // CREATE FOLDER
    // =================================================

    if (!fs.existsSync(uploadPath)) {

        fs.mkdirSync(uploadPath, {
            recursive: true
        });

    }

    console.log("UPLOAD PATH:", uploadPath);

    // =================================================
    // STORAGE
    // =================================================

    const storage = multer.diskStorage({

        destination: (req, file, cb) => {

            cb(null, uploadPath);

        },

        filename: (req, file, cb) => {

            const ext = path
                .extname(file.originalname)
                .toLowerCase();

            const filename =
                `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

            cb(null, filename);

        }

    });

    // =================================================
    // FILE FILTER
    // =================================================

    const fileFilter = (req, file, cb) => {

        // ---------------------------------------------
        // IMAGE ONLY
        // ---------------------------------------------

        if (options.imagesOnly) {

            if (
                file.mimetype &&
                file.mimetype.startsWith("image/")
            ) {

                cb(null, true);

            } else {

                cb(
                    new Error("Only image files are allowed"),
                    false
                );

            }

            return;
        }

        // ---------------------------------------------
        // IMAGES + PDF
        // ---------------------------------------------

        const allowedTypes = [

            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "application/pdf"

        ];

        if (allowedTypes.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only JPG, PNG, WEBP and PDF files are allowed"
                ),
                false
            );

        }

    };

    // =================================================
    // MULTER
    // =================================================

    return multer({

        storage,

        fileFilter,

        limits: {

            files: options.maxFiles || 5,

            fileSize:
                options.maxSize || 5 * 1024 * 1024

        }

    });

};


// =====================================================
// CATEGORY
// =====================================================

export const categoryUpload =
    createUploader("categories", {
        imagesOnly: true,
        maxFiles: 5
    });


// =====================================================
// BRAND
// =====================================================

export const brandUpload =
    createUploader("brands", {
        imagesOnly: true,
        maxFiles: 5
    });


// =====================================================
// PRODUCT
// =====================================================

export const productUpload =
    createUploader("products", {
        imagesOnly: true,
        maxFiles: 5
    });


// =====================================================
// RENTAL DOCUMENT
// =====================================================

export const rentalDocumentUpload =
    createUploader("rental-documents", {
        imagesOnly: false,
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024
    });