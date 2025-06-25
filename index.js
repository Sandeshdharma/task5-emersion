const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
const path = require("path");
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session configuration
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// In-memory data storage
let vehicles = [];
let users = [];
let currentVehicleId = 1;
let currentUserId = 1;

// User model
class User {
  constructor(id, username, email, password, age) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.age = age;
  }
}

// Passport configuration
passport.use(
  new LocalStrategy((username, password, done) => {
    const user = users.find((u) => u.username === username);
    if (!user) return done(null, false, { message: "Incorrect username" });

    bcrypt.compare(password, user.password, (err, res) => {
      if (res) return done(null, user);
      return done(null, false, { message: "Incorrect password" });
    });
  })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  done(null, user);
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};

// Routes
app.get("/", (req, res) => {
  res.render("index", {
    vehicles,
    user: req.user,
  });
});

// Registration routes
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, email, password, age } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User(
    currentUserId++,
    username,
    email,
    hashedPassword,
    age
  );

  users.push(newUser);
  res.redirect("/login");
});

// Login routes
app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: false,
  })
);

// Logout route
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Protected vehicle routes
app.post("/vehicles", isAuthenticated, (req, res) => {
  const { vehicleName, price, image, desc, brand } = req.body;
  const newVehicle = {
    id: currentVehicleId++,
    vehicleName,
    price,
    image,
    desc,
    brand,
    userId: req.user.id,
  };
  vehicles.push(newVehicle);
  res.redirect("/");
});

app.get("/vehicles", isAuthenticated, (req, res) => {
  res.json(vehicles);
});

app.get("/vehicles/:id", isAuthenticated, (req, res) => {
  const vehicle = vehicles.find((v) => v.id === parseInt(req.params.id));
  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(404).json({ error: "Vehicle not found" });
  }
});

app.put("/vehicles/:id", isAuthenticated, (req, res) => {
  const index = vehicles.findIndex((v) => v.id === parseInt(req.params.id));
  if (index !== -1) {
    vehicles[index] = { ...vehicles[index], ...req.body };
    res.json(vehicles[index]);
  } else {
    res.status(404).json({ error: "Vehicle not found" });
  }
});

app.delete("/vehicles/:id", isAuthenticated, (req, res) => {
  const index = vehicles.findIndex((v) => v.id === parseInt(req.params.id));
  if (index !== -1) {
    vehicles.splice(index, 1);
    res.json({ message: "Vehicle deleted" });
  } else {
    res.status(404).json({ error: "Vehicle not found" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
