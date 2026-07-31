// export const validate = (schema) => {

//     return (req, res, next) => {

//         console.log("=================================");
//         console.log("Incoming Body =", req.body);

//         const { error } = schema.validate(

//             req.body,

//             {

//                 abortEarly: false

//             }

//         );

//         if (error) {

//             console.log("Validation Error =", error.details);

//             return res.status(400).json({

//                 success: false,

//                 message: "Validation Error",

//                 errors: error.details.map(

//                     err => err.message

//                 )

//             });

//         }

//         next();

//     };

// };


export const validate = (schema) => {

    return (req, res, next) => {

        console.log("=================================");
        console.log("VALIDATION MIDDLEWARE");
        console.log("REQUEST BODY =", req.body);

        const {
            error,
            value
        } = schema.validate(

            req.body,

            {
                abortEarly: false,

                allowUnknown: false,

                stripUnknown: false,

            }

        );

        if (error) {

            console.error(
                "VALIDATION ERROR =",
                error.details
            );

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error",

                errors:
                    error.details.map(
                        (err) => err.message
                    ),

            });

        }

        // Validated body
        req.body = value;

        next();

    };

};