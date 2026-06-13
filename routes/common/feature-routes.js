const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
  updateFeatureImage,
  deleteFeatureImage,
} = require("../../controllers/common/feature-controller");

const router = express.Router();

router.post("/add", addFeatureImage);
router.get("/get", getFeatureImages);
router.put("/update/:id", updateFeatureImage);
router.delete("/delete/:id", deleteFeatureImage);

module.exports = router;