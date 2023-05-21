const db = require("../util/database");

const isOwner = async (req, res, next) => {
  const appointment = await db.appointment.findUnique({
    where: {
      id: Number(req.params.id),
    },
    include: {
      Pet: true,
    }
  });

  if (!appointment) {
    return res.status(404).json({
      error: "appointment not found.",
    });
  }

  if (appointment?.Pet?.userId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "forbidden",
    });
  }

  req.appointment = appointment;
  next();
}

module.exports.isOwner = isOwner;
