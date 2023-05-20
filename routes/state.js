const express = require("express");
const router = express.Router();
const db = require("../util/database");
const { isLogin } = require("../middlewares/user");
const { isOwner } = require("../middlewares/state");
const { stateSchema } = require("../util/schema");

router.put("/:id", isLogin, isOwner, async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (data.date) {
    data.date = new Date(data.date);
  }
  let stateSchemaOption = stateSchema.partial();

  try {
    var trustData = stateSchemaOption.parse(data);
  } catch (err) {
    return res.status(400).json({ error: err.errors });
  }

  try {
    const updataData = await db.state.update({
      where: {
        id: Number(id),
      },
      data: {
        ...trustData,
      },
    });
    return res.status(200).json({ message: "success", data: updataData });
  } catch (err) {
    return res.status(500).json({ error: "internal server error" });
  }
});

router.delete("/:id", isLogin, isOwner, async (req, res) => {
  const { id } = req.params;

  try {
    await db.state.delete({
      where: {
        id: Number(id),
      },
    });
    return res.status(200).json({ message: "success" });
  } catch (err) {
    return res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
