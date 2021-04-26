const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    const alltags = await Tag.findAll({ include: [Product] });
    res.status(200).json(alltags);
  }
  catch (e) {
    res.status(400).json(e);
  }
  // be sure to include its associated Product data
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  const { id } = req.params;
  try {
    const tagById = await Tag.findOne({ where: { id }, include: [Product] });
    if (!tagById) {
      return res.status(400).json({ error: `There is no Tag with the Id of ${id}` });
    }
    res.status(200).json(tagById);
  }
  catch (e) {
    res.status(400).json(e);
  }
  // be sure to include its associated Product data
});

router.post('/', async (req, res) => {
  // create a new tag
  let { tag_name } = req.body;
  // create a new tag
  try {
    if (!tag_name) {
      return res.status(400).json({ error: `You must enter a tag name` });
    }
    tag_name = tag_name.trim();
    const newTag = await Tag.create({ tag_name });
    res.json(newTag);
  }
  catch (e) {
    res.status(400).json(e);
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  const { id } = req.params;
  let { tag_name } = req.body;
  try {
    await Tag.update({ tag_name }, { where: { id } });
    const tagById = await Tag.findOne({ where: { id } });
    if (!tagById) {
      return res.status(400).json({ error: `There is no tag with the Id of ${id}` });
    }
    res.json(tagById);
  } catch (e) {
    res.status(400).json(e);
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  const { id } = req.params;
  try {
    const tagById = await Tag.findOne({ where: { id } });
    if (!tagById) {
      return res.status(400).json({ error: `There is no Tag with the Id of ${id}` });
    }
    await Tag.destroy({ where: { id } });
    res.status(200).json({ Deleted: tagById });

  } catch (e) {
    res.status(400).json(e);
  }
});

module.exports = router;
