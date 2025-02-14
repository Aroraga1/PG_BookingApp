require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./midleware/auth");
require("./db/conn.js");
const Register = require("./models/register");
const uploadm = require("./models/upload");
const multer = require("multer");
const { log } = require("console");
const { read } = require("fs");
const { register } = require("module");
const script = require("../public/script/index.js");
const { features } = require("process");
const port = 3000;

const static_path = path.join(__dirname, "../public");
const views_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");
const pictures_path = path.join(__dirname, "../../pictures");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", views_path);
hbs.registerPartials(partial_path);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

hbs.registerHelper("eq", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

// Helper function to check login status
function checkLoginState(req, res, next) {
  if (req.cookies.jwt) {
    try {
      const token = req.cookies.jwt;
      const de = jwt.verify(token, process.env.SECRET_KEY);
      res.locals.isLoggedIn = true;
      req.username = de;
    } catch (e) {
      res.locals.isLoggedIn = false;
    }
  } else {
    res.locals.isLoggedIn = false;
  }
  // console.log(`checkLoginState middleware: isLoggedIn = ${res.locals.isLoggedIn}`);
  next();
}

// Routes
const getRandomData = async (data,x) => {
  return data.sort(() => 0.5 - Math.random()).slice(0, x);
};

// Index route
app.get("/index", checkLoginState, async (req, res) => {
  try {
    const checkUser = await Register.findById(req.username);
    if (!checkUser) return res.status(400).render("secret");
    const pgdata = await uploadm.find();
    const randomPgdata = await getRandomData(pgdata,19);
    let userData = null;
    if (res.locals.isLoggedIn) {
      const token = req.cookies.jwt;
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      userData = await Register.findById(decoded._id);
    }
    res.render("index", {
      randomPgdata,
      isLoggedIn: res.locals.isLoggedIn,
      userData,
      pgdata,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Search route to display search results
app.get('/searchs/:search?', async (req, res) => {
  try {
    const query = req.query.address || '';
    const searchResults = await uploadm.find({
      address: { $regex: query, $options: 'i' }, // Case-insensitive search
    });

    // Render the results using HBS
    res.render('searchs', { pgList: searchResults });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.get("/hostel/:id", checkLoginState, async (req, res) => {
  const checkUser = await Register.findById(req.username);
  if (!checkUser) return res.status(400).render("secret");
  try {
    const searchAdd = req.params.id;
    const foundPG = await uploadm.findById(searchAdd);
    if (!searchAdd) {
      res.status(404).send("Card not found");
    }
    res.status(201).render("hostel", { isLoggedIn: res.locals.isLoggedIn });
  } catch (e) {
    res.status(400).send("thers is an error");
  }
});

app.get("/register", checkLoginState, (req, res) => {
  res.render("register", { isLoggedIn: res.locals.isLoggedIn });
});

app.get("/login", checkLoginState, (req, res) => {
  res.render("login", { isLoggedIn: res.locals.isLoggedIn });
});

app.get("/hostel", checkLoginState, async (req, res) => {
  const pgdata = await uploadm.find();
  const randomData = await getRandomData(pgdata, 6);
  res.render("hostel", { pgdata: randomData, isLoggedIn: res.locals.isLoggedIn });
});


app.get("/room", checkLoginState, async (req, res) => {
  const checkUser = await Register.findById(req.username);
  if (!checkUser) return res.status(400).render("secret");
  try {
    const pgdata = await uploadm.find();
    const randomPgdata = pgdata.sort(() => 0.5 - Math.random()).slice(0, 3);
    let userData = null;
    if (res.locals.isLoggedIn) {
      const token = req.cookies.jwt;
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      userData = await Register.findById(decoded._id);
    }
    res.render("index", {
      randomPgdata,
      isLoggedIn: res.locals.isLoggedIn,
      userData,
      pgdata,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
  res.render("room", { isLoggedIn: res.locals.isLoggedIn });
});

app.get("/more", checkLoginState, async (req, res) => {
  const checkUser = await Register.findById(req.username);
  if (!checkUser) return res.status(400).render("secret");
  try {
    const pgdata = await uploadm.find();
    res
      .status(200)
      .render("more", { pgdata, isLoggedIn: res.locals.isLoggedIn });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.get("/details/:id", checkLoginState, async (req, res) => {
  const checkUser = await Register.findById(req.username);
  if (!checkUser) return res.status(400).render("secret");
  try {
    const cardId = req.params.id;
    const cardDetails = await uploadm.findById(cardId);
    if (!cardDetails) {
      return res.status(404).send("Card not found");
    }
    res.render("details", { cardDetails, isLoggedIn: res.locals.isLoggedIn });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/about", checkLoginState, (req, res) => {
  res.render("about", { isLoggedIn: res.locals.isLoggedIn });
});

app.get("/upload", checkLoginState, async (req, res) => {
  const checkUser = await Register.findById(req.username);
  if (!checkUser) return res.status(400).render("secret");
  res.render("upload", { isLoggedIn: res.locals.isLoggedIn });
});

app.get("/secret", checkLoginState, (req, res) => {
  res.render("secret", { isLoggedIn: res.locals.isLoggedIn });
});

// Storage and file setting
// const storage = multer.diskStorage({
//     destination: "../../pictures/", // Ensure this path is correct
//     filename: (req, file, cb) => {
//         cb(null, file.originalname);
//     }
// });

// const upload = multer({ storage: storage });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route to handle file upload
// app.post('/upload', upload.single("pics"), async (req, res) => {
app.post(
  "/upload",
  checkLoginState,
  upload.fields([{ name: "pic1" }, { name: "pic2" }, { name: "pic3" }]),
  async (req, res) => {
    const checkUser = await Register.findById(req.username);
    if (!checkUser) return res.status(400).render("secret");
    try {
      if (
        !req.files ||
        !req.files["pic1"] ||
        !req.files["pic2"] ||
        !req.files["pic3"]
      ) {
        return res.status(400).send("Please upload all required files");
      }
      if (typeof req.body.features === "string") {
        req.body.features = req.body.features
          .split(",")
          .map((item) => item.trim());
      }
      if (typeof req.body.facilities === "string") {
        req.body.facilities = req.body.facilities
          .split(",")
          .map((item) => item.trim());
      }
      if (typeof req.body.suitability === "string") {
        req.body.suitability = req.body.suitability
          .split(",")
          .map((item) => item.trim());
      }
      // console.log(req.files.pic1);
      const pgData = await uploadm.findOne({ pgName: req.body.pgName });
      const pgRegister = new uploadm({
        Oname: req.body.Oname,
        Oph: req.body.Oph,
        Oemail: req.body.Oemail,
        Oadd: req.body.Oadd,
        pgName: req.body.pgName,
        features: req.body.features,
        facilities: req.body.facilities,
        suitability: req.body.suitability,
        rental: req.body.rental,
        address: req.body.address,
        description: req.body.description,
        pic1: req.files["pic1"][0].filename,
        pic2: req.files["pic2"][0].filename,
        pic3: req.files["pic3"][0].filename,
      });
      await pgRegister.save();
      res.status(201).render("index");
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);

app.get("/logout", checkLoginState, auth, async (req, res) => {
  try {
    // For logout from particular device
    req.user.tokens = req.user.tokens.filter((currentToken) => {
      return currentToken != req.token;
    });

    // For logout from all devices at once
    // req.user.tokens = [];

    res.clearCookie("jwt");
    await req.user.save();

    // Redirect to the login page after logout and reload window
    res.redirect("/login");
  } catch (error) {
    res.status(500).send(error);
  }
});


setTimeout(() => {
  try {
  } catch (error) {}
});
// Registration
app.post("/register", checkLoginState, async (req, res) => {
  try {
    const UserData = await Register.findOne({ username: req.body.username });

    if (UserData) {
      return res.status(400).send("Username already taken");
    }

    if (req.body.password === req.body.cpassword) {
      const registerEmployee = new Register({
        username: req.body.username,
        phoneNo: req.body.phoneNo,
        email: req.body.email,
        password: req.body.password,
        cpassword: req.body.cpassword,
        accountType: req.body.accountType,
      });

      const token = await registerEmployee.generateAuthToken();

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 60),
        httpOnly: true,
      });

      await registerEmployee.save();
      res
        .status(201)
        .render("index", { isLoggedIn: res.locals.isLoggedIn, UserData });
    } else {
      res.send("Passwords do not match");
    }
  } catch (error) {
    res.status(400).send(error.message);
    console.log(error);
  }
});

// Login part
app.post("/login", checkLoginState, async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const UserData = await Register.findOne({ username: username });

    const Pcheack = await bcrypt.compare(password, UserData.password);
    const token = await UserData.generateAuthToken();

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 60),
      httpOnly: true,
    });

    if (UserData.username === username && Pcheack) {
      // Redirect to the home page after successful login
      res.redirect("/index");
    } else {
      res.send("Username or password are not correct");
    }
  } catch (e) {
    res.status(400).send("Something went wrong");
  }
});


app.get("/registers", async (req, res) => {
  try {
    const registers = await Register.find();
    res.render("registers", { registers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createToken = async () => {
  const Token = await jwt.sign(
    { _id: "febgr35rwt54f8zw43trfzedsw43trfW" },
    "ImGarvitAroraandLivingCurrentlyinjaipur",
    { expiresIn: "2 minutes" }
  );
  const UserVarify = await jwt.verify(
    Token,
    "ImGarvitAroraandLivingCurrentlyinjaipur"
  );
};
createToken();

app.listen(port, () => {
  console.log(`connected at ${port}`);
});
