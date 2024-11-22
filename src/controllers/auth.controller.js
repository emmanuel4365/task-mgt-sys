const User = require("../model/user.model");
const path = require("path");
const { hash, compare } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getTemplate } = require("../utils/getTemplate");

const registerUser = async (req, res) => {
  const email = req.body.email;

  const checkUser = await User.find({ email });
  console.log(checkUser);

  if (checkUser[0]) {
    res
      .status(400)
      .sendFile(path.resolve(__dirname, "../../public/html/checkUser.html"));
    return;
  }

  //hash password
  const hashedPassword = await hash(req.body.password, 10);

  //create user
  const user = await User.create({ ...req.body, password: hashedPassword });

  res
    .status(201)
    .sendFile(
      path.resolve(__dirname, "../../public/html/registerSuccess.html")
    );
  return;
};

const loginUser = async (req, res) => {
  const user = await User.find({ email: req.body.email });
  console.log(user);

  if (!user[0]) {
    res
      .status(400)
      .sendFile(path.join(__dirname, "../../public/html/callToRegister.html"));
    return;
  }

  const isPasswordCorrect = await compare(req.body.password, user[0].password);
  console.log(isPasswordCorrect);

  if (!isPasswordCorrect) {
    res
      .status(400)
      .sendFile(
        path.resolve(__dirname, "../../public/html/invalidPassword.html")
      );
    return;
  }

  const token = jwt.sign({ userID: `${user[0]._id}` }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });

  console.log(token);

  res.cookie("todoToken", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const taskTemplate = getTemplate(user[0].lastName);

  res.status(200).send(taskTemplate);
};

const logoutUser = async (req, res) => {
  res.cookie("todoToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).redirect("http://localhost:5100/");
};

module.exports = { registerUser, loginUser, logoutUser };
