import {
  createBrandService,
  getBrandsService,
  getBrandService,
  updateBrandService,
  deleteBrandService,
} from "./brand.service.js";

// export const createBrand = async (req, res) => {
//   try {
//     const brand = await createBrandService(
//       req.body,
//       req.user.id
//     );

//     res.status(201).json({
//       success: true,
//       message: "Brand created successfully",
//       data: brand,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const createBrand = async (req, res) => {

    try {

        if (req.file) {

            req.body.logo =
                `/uploads/brands/${req.file.filename}`;

        }

        const brand = await createBrandService(

            req.body,

            req.user.id

        );

        res.status(201).json({

            success: true,

            message: "Brand Created Successfully",

            data: brand

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


export const getBrands = async (req, res) => {
  try {
    const brands = await getBrandsService();

    res.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBrand = async (req, res) => {
  try {
    const brand = await getBrandService(req.params.id);

    res.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const brand = await updateBrandService(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    await deleteBrandService(req.params.id);

    res.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};