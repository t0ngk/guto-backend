const z = require("zod");

const appointmentSchema = z.object({
  name: z.string(),
  date: z.date(),
  time: z.string(),
  description: z.string(),
  service: z.string(),
  serviceOf: z.string(),
});

const stateSchema = z.object({
  name: z.string(),
  date: z.date(),
  time: z.string(),
  type: z.enum(["success", "warning", "error", "info"]),
});

const petSchema = z.object({
  name: z.string(),
  type: z.string(),
  gender: z.string(),
  age: z.number(),
  description: z.string(),
});

module.exports.appointmentSchema = appointmentSchema;
module.exports.stateSchema = stateSchema;
module.exports.petSchema = petSchema;
