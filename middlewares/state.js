const db = require("../util/database");

async function isOwner(req, res, next) {
  const state = await db.state.findUnique({
    where: {
      id: Number(req.params.id),
    },
    include: {
      Appointment: {
        include: {
          Pet: {
            include: {
              User: true,
            },
          },
        },
      },
    },
  });

  if (!state) {
    return res.status(404).json({
      error: "state not found.",
    });
  }
  
  const userId = state?.Appointment?.Pet?.User?.id;
  if (userId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "forbidden",
    });
  }

  req.state = state;
  next();
}

module.exports.isOwner = isOwner;
