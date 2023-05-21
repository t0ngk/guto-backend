const express = require("express");
const router = express.Router();
const db = require("../util/database");
const z = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { isLogin, isAdmin } = require("../middlewares/user");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/uploads/profile");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Register
router.post("/", async (req, res) => {
  const data = req.body;

  const userSchema = z.object({
    email: z.string().email().max(255),
    password: z.string(),
    fname: z.string().max(255),
    lname: z.string().max(255),
    phone: z.string().max(255),
    address: z.string().max(255),
  });

  try {
    var trustData = userSchema.parse(data);
  } catch (err) {
    return res.status(400).json({
      error: err.errors,
    });
  }

  try {
    const getUser = await db.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (getUser) {
      return res.status(400).json({
        error: "email already in use.",
      });
    }

    trustData.password = await bcrypt.hash(trustData.password, 10);
    const user = await db.user.create({
      data: trustData,
      select: {
        id: true,
        email: true,
        fname: true,
        lname: true,
        phone: true,
        address: true,
      },
    });

    res.status(200).json({
      message: "user created successfully",
      data: user,
    });
    return;
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

//login
router.post("/login", async (req, res) => {
  const data = req.body;

  const userSchema = z.object({
    email: z.string().email().max(255),
    password: z.string(),
  });

  try {
    var trustData = userSchema.parse(data);
  } catch (err) {
    return res.status(400).json({
      error: err.errors,
    });
  }

  try {
    const user = await db.user.findUnique({
      where: {
        email: trustData.email,
      },
    });

    if (!user) {
      return res.status(400).json({
        error: "email or password is incorrect.",
      });
    }

    const match = await bcrypt.compare(trustData.password, user.password);

    if (!match) {
      return res.status(400).json({
        error: "email or password is incorrect.",
      });
    }

    return res.status(200).json({
      message: "user logged in successfully",
      data: {
        token: jwt.sign({ id: user.id }, "gutoSuperSecert"),
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

router.get("/", isLogin ,isAdmin, async (req, res) => {
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      fname: true,
      lname: true,
      phone: true,
      address: true,
      profileImg: true,
    },
  });

  res.status(200).json({
    message: "users",
    data: users,
  });
});

//get user
router.get("/me", isLogin, async (req, res) => {
  delete req.user.password;
  res.status(200).json({
    message: "Profile",
    data: req.user,
  });
});

let profileUpload = multer({ storage: storage }).single("profile");

router.put("/:id/role/:role", isLogin, isAdmin, async (req, res) => {
  const { id, role } = req.params;

  try {
    var trustData = z.object({
      role: z.enum(["ADMIN", "USER"]),
    }).parse({ role: role });
  } catch (error) {
    return res.status(400).json({
      error: error.errors,
    });
  }

  const getUser = await db.user.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!getUser) {
    return res.status(400).json({
      error: "user not found",
    });
  }

  const user = await db.user.update({
    where: {
      id: Number(id),
    },
    data: {
      ...trustData
    },
    select: {
      id: true,
      email: true,
      fname: true,
      lname: true,
      phone: true,
      address: true,
      profileImg: true,
    },
  });

  return res.status(200).json({
    message: "user updated",
    data: user,
  });

});

//upload profile image
router.post("/profile", isLogin, profileUpload, async (req, res) => {
  const user = await db.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      profileImg: req.file.path,
    },
    select: {
      id: true,
      email: true,
      fname: true,
      lname: true,
      phone: true,
      address: true,
      profileImg: true,
    },
  });
  return res.status(200).json({
    message: "profile image updated",
    data: user,
  });
});

// update user
router.put("/", isLogin, async (req, res) => {
  const data = req.body;

  const userSchema = z
    .object({
      email: z.string().email().max(255),
      fname: z.string().max(255),
      lname: z.string().max(255),
      phone: z.string().max(255),
      address: z.string().max(255),
      oldpassword: z.string(),
      password: z.string(),
      confirmPassword: z.string(),
    })
    .partial();

  try {
    var trustData = userSchema.parse(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: err.errors,
    });
  }

  try {
    if (trustData.password) {
      if (!trustData.oldpassword) {
        return res.status(400).json({
          error: "oldpassword is required",
        });
      }

      const user = await db.user.findUnique({
        where: {
          id: req.user.id,
        },
      });

      const match = await bcrypt.compare(trustData.oldpassword, user.password);

      if (!match) {
        return res.status(400).json({
          error: "oldpassword is incorrect",
        });
      }

      if (trustData.password !== trustData.confirmPassword) {
        return res.status(400).json({
          error: "password and confirmPassword not match",
        });
      }
      trustData.password = await bcrypt.hash(trustData.password, 10);
      delete trustData.oldpassword;
      delete trustData.confirmPassword;
    }

    const user = await db.user.update({
      where: {
        id: req.user.id,
      },
      data: trustData,
      select: {
        id: true,
        email: true,
        fname: true,
        lname: true,
        phone: true,
        address: true,
      },
    });

    res.status(200).json({
      message: "user updated successfully",
      data: user,
    });
    return;
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

router.get("/:id", isLogin, isAdmin, async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "user not found",
      });
    }

    res.status(200).json({
      message: "user details",
      data: user,
    });
    return;
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

router.get("/:id/pets", isLogin, isAdmin, async (req, res) => {
  try {
    const pets = await db.pet.findMany({
      where: {
        userId: Number(req.params.id),
      },
    });

    res.status(200).json({
      message: "user pets",
      data: pets,
    });
    return;
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

router.get("/me/appointment", isLogin, async (req, res) => {
  try {
    const appointments = await db.appointment.findMany({
      where: {
        Pet: {
          userId: req.user.id,
        }
      },
    });

    res.status(200).json({
      message: "user appointments",
      data: appointments,
    });
    return;
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

router.get("/:id/appointment", isLogin, isAdmin, async (req, res) => {
  try {
    const appointments = await db.appointment.findMany({
      where: {
        Pet: {
          userId: Number(req.params.id),
        }
      },
    });

    res.status(200).json({
      message: "user appointments",
      data: appointments,
    });
    return;
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});



module.exports = router;
