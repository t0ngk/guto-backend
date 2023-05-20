const express = require("express");
const router = express.Router();
const db = require("../util/database");
const { isLogin, isAdmin } = require("../middlewares/user");
const { isOwner } = require("../middlewares/appointment");
const { appointmentSchema } = require("../util/schema");

router.get("/", isLogin, isAdmin, async (req, res) => {
  try {
    const appointment = await db.appointment.findMany({
      where: {
        status: "PENDING"
      }
    });
    return res.status(200).json({ message: "success", data: appointment });
  } catch (err) {
    return res.status(500).json({ error: "internal server error" });
  }
});

router.put("/:id", isLogin, isOwner, async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  let appointmentSchemaOption = appointmentSchema.partial();

  data.date = new Date(data.date);

  try {
    var trustData = appointmentSchemaOption.parse(data);
  } catch (err) {
    return res.status(400).json({ error: err.errors });
  }

  try {
    const updataData = await db.appointment.update({
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
    await db.appointment.delete({
      where: {
        id: Number(id),
      },
    });
    return res.status(200).json({ message: "success" });
  } catch (err) {
    return res.status(500).json({ error: "internal server error" });
  }
});

router.post("/:id/state", isLogin, isOwner, async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  console.log(data);

  try {
    const stateData = await db.state.create({
      data: {
        ...data,
        Appointment: {
          connect: {
            id: Number(id),
          },
        },
      },
    });
    return res.status(200).json({ message: "success", data: stateData });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
});

router.get("/:id/state", isLogin, isOwner, async (req, res) => {
  const { id } = req.params;

  try {
    const stateData = await db.appointment.findMany({
      where: {
        id: Number(id),
      },
      select: {
        state: true,
      }
    });
    return res.status(200).json({ message: "success", data: stateData });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
