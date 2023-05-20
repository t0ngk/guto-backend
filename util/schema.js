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
});

module.exports.appointmentSchema = appointmentSchema;
module.exports.stateSchema = stateSchema;
