const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const allProducts = await Product.findAll({ include: [Category, Tag] });
    res.status(200).json(allProducts);
  }
  catch (e) {
    res.status(400).json(e);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const productById = await Product.findOne({ where: { id }, include: [Category, Tag] });
    if (!productById) {
      return res.status(400).json({ error: `There is no category with the Id of ${id}` });
    }
    res.status(200).json(productById);
  }
  catch (e) {
    res.status(400).json(e);
  }
});

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "New BTS Album",
      price: 200.00,
      stock: 3,
      category_id: 4,
      tagIds: [1, 2, 3, 4]
    }
  */
 try { 
   const newProduct = await Product.create(req.body);
   newProduct().then((product) => {
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      return ProductTag.bulkCreate(productTagIdArr);
    }
    // if no product tags, just respond
    res.status(200).json(newProduct);
  })
  .then((productTagIds) => res.status(200).json(productTagIds))}
  
  catch (e) {
    res.status(400).json(e);
  };
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  const { id } = req.params;
  try {
    const productById = await Product.findOne({ where: { id } });
    if (!productById) {
      return res.status(400).json({ error: `There is no product with the Id of ${id}` });
    }
    await Product.destroy({ where: { id } });
    res.status(200).json({ Deleted: productById });

  } catch (e) {
    res.status(400).json(e);
  }
});

module.exports = router;
