const db = require("../util/database");

async function isOwner(req, res, next) {
  const pet = await db.pet.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  if (!pet) {
    return res.status(404).json({
      error: "pet not found.",
    });
  }

  if (pet.userId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "forbidden",
    });
  }

  req.pet = pet;
  next();
}

module.exports.isOwner = isOwner;
