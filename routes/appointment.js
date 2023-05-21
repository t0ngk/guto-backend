const express = require("express");
const router = express.Router();
const db = require("../util/database");
const { isLogin, isAdmin } = require("../middlewares/user");
const { isOwner } = require("../middlewares/appointment");
const { appointmentSchema, stateSchema } = require("../util/schema");
const { z } = require("zod");

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

router.put("/:id/:type", isLogin, isOwner, async (req, res) => {
  const { id, type } = req.params;

  try {
    var data = z.enum(["APPROVED", "REJECTED", "PENDING", "CLOSED"]).parse(type);
  } catch (err) {
    return res.status(400).json({ error: err.errors });
  }

  const lang = {
    APPROVED: "อนุมัติคำขอ",
    REJECTED: "ปฏิเสธคำขอ",
    PENDING: "รอการตรวจสอบ",
    CLOSED: "ปิดการนัดหมาย",
  }

  try {
    const appointmentData = await db.appointment.update({
      where: {
        id: Number(id),
      },
      data: {
        status: data,
        state: {
          create: {
            name: lang[data],
          }
        }
      },
    });

    return res.status(200).json({ message: "success", data: appointmentData });
  } catch (err) {
    console.log(err);
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
    await db.state.deleteMany({
      where: {
        appointmentId: Number(id),
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

  if (data.date) {
    data.date = new Date(data.date);
  }
  
  const stateSchemaOption = stateSchema.partial().required({
    name: true,
  });

  try {
    var trustData = stateSchemaOption.parse(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.errors });
  }

  try {
    const stateData = await db.state.create({
      data: {
        ...trustData,
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

router.post("/:id/state/next", isLogin, isOwner, async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (data.date) {
    data.date = new Date(data.date);
  }

  const stateSchemaOption = stateSchema.extend({
    time: z.string().max(255),
  }).partial().required({
    name: true,
  });

  try {
    var trustData = stateSchemaOption.parse(data);
    var trustTime = {date: trustData.date};
    if (trustData.time) {
      trustTime.time = trustData.time;
    }
    console.log(trustData);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.errors });
  }

  try {
    const stateData = await db.state.create({
      data: {
        ...trustData,
        Appointment: {
          connect: {
            id: Number(id),
          },
        },
      },
    });

    await db.appointment.update({
      where: {
        id: Number(id),
      },
      data: {
        ...trustTime
      }
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

router.post("/new", isLogin, async (req, res) => {
  const data = req.body;

  if (data.date) {
    data.date = new Date(data.date);
  }
  console.log(data);

  const petSchema = z.object({
    namePet: z.string(),
    typePet: z.string(),
    genderPet: z.string(),
    agePet: z.number(),
    descriptionPet: z.string(),
  });

  try {
    var trustDataPet = petSchema.parse(data);
    var trustData = appointmentSchema.parse(data);
    delete trustData.namePet;
  }
  catch (err) {
    return res.status(400).json({ error: err.errors });
  }

  try {
    console.log(trustDataPet);
    console.log(trustData);
    const appointment = await db.appointment.create({
      data: {
        ...trustData,
        Pet: {
          create: {
            name: trustDataPet.namePet,
            type: trustDataPet.typePet,
            gender: trustDataPet.genderPet,
            age: trustDataPet.agePet,
            description: trustDataPet.descriptionPet,
            User: {
              connect: {
                id: Number(req.user.id),
              }
            }
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
    return res.status(200).json({ message: "success", data: appointment });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
