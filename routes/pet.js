const express = require("express");
const router = express.Router();
const db = require("../util/database");
const { appointmentSchema, petSchema } = require("../util/schema");
const z = require("zod");
const { isLogin } = require("../middlewares/user");
const { isOwner } = require("../middlewares/pet");

router.post("/", isLogin, async (req, res) => {
  try {
    var trustData = petSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({
      error: err.errors,
    });
  }

  try {
    const pet = await db.pet.create({
      data: {
        ...trustData,
        User: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });

    return res.status(200).json({
      message: "success",
      data: pet,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

router.put("/:id", isLogin, isOwner, async (req, res) => {
  const data = req.body;

  const updatePetSchema = petSchema.partial();

  try {
    var trustData = updatePetSchema.parse(data);
  } catch (err) {
    return res.status(400).json({
      error: err.errors,
    });
  }

  try {
    const pet = await db.pet.update({
      where: {
        id: Number(req.params.id),
      },
      data: trustData,
    });

    return res.status(200).json({
      message: "success",
      data: pet,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

router.delete("/:id", isLogin, isOwner, async (req, res) => {
  try {
    await db.pet.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    await db.appointment.deleteMany({
      where: {
        petId: Number(req.params.id),
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }

  return res.status(200).json({
    message: "success",
  });
});

router.get("/me", isLogin, async (req, res) => {
  try {
    const pets = await db.pet.findMany({
      where: {
        userId: req.user.id,
      },
    });

    return res.status(200).json({
      message: "success",
      data: pets,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

router.get("/:id", isLogin, async (req, res) => {
  try {
    const pet = await db.pet.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    return res.status(200).json({
      message: "success",
      data: pet,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});


router.post("/:id/appointment", isLogin, isOwner, async (req, res) => {
  const data = req.body;

  data.date = new Date(data.date);

  try {
    var trustData = appointmentSchema.parse(data);
  } catch (err) {
    return res.status(400).json({
      error: err.errors,
    });
  }

  try {
    const appointment = await db.appointment.create({
      data: {
        ...trustData,
        Pet: {
          connect: {
            id: Number(req.params.id),
          },
        },
        state: {
          createMany: {
            data: [{
              name: "ส่งคำขอจอง"
            },
          {
            name : "รอการตรวจสอบ"
          }]
          }
        }
      },
    });

    return res.status(200).json({
      message: "success",
      data: appointment,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

router.get("/:id/appointment", isLogin, isOwner, async (req, res) => {
  try {
    const appointments = await db.appointment.findMany({
      where: {
        petId: Number(req.params.id),
      },
    });

    return res.status(200).json({
      message: "success",
      data: appointments,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

module.exports = router;
