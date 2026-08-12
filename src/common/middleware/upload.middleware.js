// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const createUploader = (folderName) => {

//     const uploadPath = `uploads/${folderName}`;

//     if (!fs.existsSync(uploadPath)) {

//         fs.mkdirSync(uploadPath, {
//             recursive: true
//         });

//     }

//     const storage = multer.diskStorage({

//         destination(req, file, cb) {

//             cb(null, uploadPath);

//         },

//         filename(req, file, cb) {

//             const ext = path.extname(file.originalname);

//             cb(
//                 null,
//                 Date.now() + ext
//             );

//         }

//     });

//     const fileFilter = (req, file, cb) => {

//         if (file.mimetype.startsWith("image/")) {

//             cb(null, true);

//         }

//         else {

//             cb(
//                 new Error("Only Images Allowed"),
//                 false
//             );

//         }

//     };

//     return multer({

//         storage,
//         fileFilter

//     });

// };

// export const categoryUpload = createUploader("categories");

// export const brandUpload = createUploader("brands");

// export const productUpload = createUploader("products");



import multer from "multer";
import path from "path";
import fs from "fs";

const createUploader = (folderName) => {

    // ==============================
    // ABSOLUTE UPLOAD PATH
    // ==============================

    const uploadPath = path.join(
        process.cwd(),
        "uploads",
        folderName
    );


    // ==============================
    // CREATE FOLDER
    // ==============================

    if (!fs.existsSync(uploadPath)) {

        fs.mkdirSync(
            uploadPath,
            {
                recursive: true
            }
        );

    }


    console.log(
        "UPLOAD PATH:",
        uploadPath
    );


    // ==============================
    // STORAGE
    // ==============================

    const storage = multer.diskStorage({

        destination: (req, file, cb) => {

            cb(
                null,
                uploadPath
            );

        },


        filename: (req, file, cb) => {

            const ext =
                path.extname(
                    file.originalname
                ).toLowerCase();

            const filename =
                `${Date.now()}-${Math.round(
                    Math.random() * 1E9
                )}${ext}`;

            cb(
                null,
                filename
            );

        }

    });


    // ==============================
    // FILE FILTER
    // ==============================

    const fileFilter = (
        req,
        file,
        cb
    ) => {

        if (
            file.mimetype &&
            file.mimetype.startsWith("image/")
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only image files are allowed"
                ),
                false
            );

        }

    };


    return multer({

        storage,

        fileFilter,

        limits: {

            files: 5,

            fileSize: 5 * 1024 * 1024

        }

    });

};


export const categoryUpload =
    createUploader("categories");


export const brandUpload =
    createUploader("brands");


export const productUpload =
    createUploader("products");