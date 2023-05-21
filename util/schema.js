const z = require("zod");

const appointmentSchema = z.object({
  name: z.string().max(255),
  date: z.date(),
  time: z.string().max(255),
  description: z.string(),
});

const stateSchema = z.object({
  name: z.string().max(255),
  date: z.date(),
  time: z.string().max(255),
  type: z.enum(["success", "warning", "error", "info"]),
});

const petSchema = z.object({
  name: z.string().max(255),
});

module.exports.appointmentSchema = appointmentSchema;
module.exports.stateSchema = stateSchema;
module.exports.petSchema = petSchema;
