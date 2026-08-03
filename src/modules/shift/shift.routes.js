import express from "express";

import {
createShift,
getShifts,
getShift,
updateShift,
deleteShift
}
from "./shift.controller.js";


const router = express.Router();



router.post(
"/",
createShift
);


router.get(
"/",
getShifts
);


router.get(
"/:id",
getShift
);


router.put(
"/:id",
updateShift
);


router.delete(
"/:id",
deleteShift
);



export default router;