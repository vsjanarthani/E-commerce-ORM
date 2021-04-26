const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  try {
    const allCategories = await Category.findAll({ include: [Product] });
    res.json(allCategories);
  }
  catch (e) {
    res.status(400).json(e);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  const { id } = req.params;
  try {
    const catById = await Category.findOne({ where: { id }, include: [Product] });
    if (!catById) {
      return res.status(400).json({ error: `There is no category with the Id of ${id}` });
    }
    res.status(200).json(catById);
  }
  catch (e) {
    res.status(400).json(e);
  }
});

router.post('/', async (req, res) => {
  let { category_name } = req.body;
  // create a new category
  try {
    if (!category_name) {
      return res.status(400).json({ error: `You must enter a category name` });
    }
    category_name = category_name.trim();
    const newCat = await Category.create({ category_name });
    res.json(newCat);
  }
  catch (e) {
    res.status(400).json(e);
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  const { id } = req.params;
  let { category_name } = req.body;
  try {
    await Category.update({ category_name }, { where: { id } });
    const catById = await Category.findOne({ where: { id } });
    if (!catById) {
      return res.status(400).json({ error: `There is no category with the Id of ${id}` });
    }
    res.json(catById);
  } catch (e) {
    res.status(400).json(e);
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  const { id } = req.params;
  try {
    const catById = await Category.findOne({ where: { id } });
    if (!catById) {
      return res.status(400).json({ error: `There is no category with the Id of ${id}` });
    }
    await Category.destroy({ where: { id } });
    res.status(200).json({ Deleted: catById });

  } catch (e) {
    res.status(400).json(e);
  }
});

module.exports = router;
