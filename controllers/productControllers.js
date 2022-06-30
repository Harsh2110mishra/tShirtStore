const Product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");
const cloudinary = require("cloudinary").v2;
const WhereClause = require("../utils/whereClause");

exports.getAllProducts = BigPromise(async (req, res, next) => {
    const resultPerPage = 6;
    const totalProductsCount = await Product.countDocuments();
    const filteredproductObj = new WhereClause(Product.find(), req.query)
        .search()
        .filter()
        .pager(resultPerPage);
    
    const filteredProductObjsCount = filteredproductObj.base.length;
    const products = await filteredproductObj.base;
    
    res.status(200).json({
        success: true,
        totalProductsCount,
        filteredProductObjsCount,
        products,

    })
});

exports.getOneProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
if (!product) {
  return next(new customError("No Product found with this id", 404));
}
  res.status(200).json({
    success: true,
    product,
  });
});

exports.addAndUpdateReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);
  const alreadyReviewed = product.reviews.find(
    // Run for every review in product db
    // rev.user is objectId stored in DB which we are converting into sting as it was `bson()` format.
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  // user already review then `if` part will run as "alreadyReviewed" will not be null.
  if (alreadyReviewed) {
    product.reviews.forEach((reviews) => {
      if (reviews.user.toString() === req.user._id.toString()) {
        (reviews.comment = comment), (reviews.rating = rating);
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }
  // adjusting rating
  // acc is accumulator and It is the value returned from the previous iteration. It will be initialValue for the first iteration.
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  //saving
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.query;
  const product = await Product.findById(productId);

  // filter will not pass the specific review we get by the condition and other will be returned.
  // so eventually we deleted it.
  const reviews = product.reviews.filter((rev) => {
    rev.user.toString() !== req.user._id.toString();
  });
  const numberOfReviews = reviews.length;

  // adjusting rating
  // acc is accumulator and It is the value returned from the previous iteration. It will be initialValue for the first iteration.
  // 0 is the initial value provided and acc will be the sum till the last items.
  const ratings =
    numberOfReviews === 0 ? 0 : reviews.reduce((acc, item) => item.rating + acc, 0)/product.reviews.length
  
  //Updating the reviews
  await Product.findByIdAndUpdate(
    productId,
    {
      ratings,
      numberOfReviews,
      reviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProductReviews = BigPromise(async (req,res,next) => {
  const product = await Product.findById(req.params.id);
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
})

// Admin controllers
exports.addProduct = BigPromise(async (req, res, next) => {
  let imageArray = [];
  if (!req.files) {
    return next(new customError("Add photos too", 404));
  } else {
    for (let index = 0; index < req.files.photos.length; index++) {
      const result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }
  req.body.photos = imageArray; // Overwriting the photos with imageArray
  req.body.user = req.user.id; // added user property from req.user.id which we are getting from loggedInUser

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAdminAllProducts = BigPromise(async (req, res, next) => {
    const products = await Product.find();
    res.status(200).json({
        success: true,
        products
    });
});

exports.updateProductAdmin = BigPromise(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new customError("No Product found with this id", 404));
    }
   
    const newData = {
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        photos: []
    };
    if (!newData.name && newData.price && newData.stock && newData.photos)
        return next(new customError("Provide detail to update", 400));

    if (req.files) {
        for (let index = 0; index < product.photos.length; index++) {
            // delete existing photos from cloudinary
            const result = await cloudinary.uploader.destroy(product.photos[index].id);
        }
        for (let index = 0; index < req.files.photos.length; index++) {
            // uploaded new photos updated by user
            const imageUpload = await cloudinary.uploader.upload(
                req.files.photos[index].tempFilePath,
                {
                    folder: "products"
                }
            );
            newData.photos.push({
                id: imageUpload[index].public_id,
                secure_url: imageUpload[index].secure_url,
            });
        }
    }
    product = await Product.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false, // For precautions, we turned off the 'useFindAndModify' as it is not needed
    });
    res.status(200).json({
        success: true,
        product,
    });
    
});

exports.deleteProductAdmin = BigPromise(async (req,res,next) => {
   const product = await Product.findById(req.params.id);
   if (!product) return next(new customError("Product doesn't exist", 404));

    for (let index = 0; index < product.photos.length; index++) {
      // deleting Products existing photos from cloudinary
      const result = await cloudinary.uploader.destroy(
        product.photos[index].id
      );
    };
 
   await product.remove();

   res.status(200).json({
     success: true,
   });
});