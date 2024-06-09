const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const User = mongoose.model("User");

const nodemailer = require("nodemailer");
// const req = require("express/lib/request");

async function mailer(receiveremail, code) {
  // send mail with defined transport object

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: "anishjha902@gmail.com",
      pass: "jkqjjadbiaghiyma",
      // jkqjjadbiaghiyma
    },
  });
  const info = await transporter.sendMail({
    from: "anishjha902@gmail.com", // sender address
    to: `${receiveremail}`, // list of receivers
    subject: "signup verification", // Subject line
    text: `your verification code is ${code}`, // plain text body
    html: `Your verification code ${code}`, // html body
  });
  ~console.log("Message sent: %s", info.messageId);
}

router.post("/verify", (req, res) => {
  console.log(req.body);
  const { email } = req.body;
  if (!email) {
    return res.status(422).json({ error: "please add all These field" });
  } else {
    // return res.status(200).json({message:'email Sent'})
    User.findOne({ email: email }).then(async (savedUser) => {
      if (savedUser) {
        return res.status(422).json({ error: "Invalid Creadentials" });
      }
      try {
        let VerificationCode = Math.floor(100000 + Math.random() * 900000);
        await mailer(email, VerificationCode);
        res.send({
          message: "Verification Code Sent to Your Email",
          VerificationCode,
          email,
        });
      } catch (err) {
        console.log(err);
      }
    });
  }
});

router.post("/changeusername", (req, res) => {
  const { username, email } = req.body;
  User.find({ username }).then(async (savedUser) => {
    if (savedUser.length > 0) {
      return res.status(422).json({ error: "User already exist" });
    } else {
      return res
        .status(422)
        .json({ message: "Username Avalaible", username, email });
    }
  });
});

router.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(422).json({ error: "please add all these field" });
  } else {
    const user = new User({
      username,
      email,
      password,
    });
    try {
      await user.save();
      const token = jwt.sign({ _id: user._id }, process.env.jWT_SECRET);
      return res
        .status(200)
        .json({ message: "User Register Succesfully", token });
    } catch (err) {
      console.log(err);
      return res.status(422).json({ error: "User Not Register" });
    }
  }
});

// forgot paassword

router.post("/verifyfp", (req, res) => {
  // console.log(req.body);
  const { email } = req.body;
  if (!email) {
    return res.status(422).json({ error: "please add all These field" });
  } else {
    // return res.status(200).json({message:'email Sent'})
    User.findOne({ email: email }).then(async (savedUser) => {
      if (savedUser) {
        try {
          let VerificationCode = Math.floor(100000 + Math.random() * 900000);
          await mailer(email, VerificationCode);
          res.send({
            message: "Verification Code Sent to Your Email",
            VerificationCode,
            email,
          });
        } catch (err) {
          console.log(err); 
        }
      } else {
        return res.status(422).json({ error: "Invalid Creadentials" });
      }
    });
  }
});

// reset password
router.post("/resetpassword", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ error: "please add all these field" });
  } else {
    User.findOne({ email: email }).then(async (savedUser) => {
      if (savedUser) {
        savedUser.password = password;
        savedUser
          .save()
          .then((user) => {
            res.json({ message: "Password Changed Succesfully" });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        return res.status(422).json({ error: "Invalid Credentials" });
      }
    });
  }
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Please Enter all The fields" });
  } else {
    User.findOne({ email: email })
      .then((savedUser) => {
        if (!savedUser) {
          return res.status(422).json({ error: "Invalid Credentials" });
        } else {
          // console.log(savedUser);
          bcrypt.compare(password, savedUser.password).then((domatch) => {
            if (domatch) {
              const token = jwt.sign(
                { _id: savedUser._id },
                process.env.jWT_SECRET
              );
              const { _id, username, email } = savedUser;
              res.json({
                message: "Succesfully Signed In",
                token,
                user: { _id, username, email, password },
              });
            } else {
              return res.status(422).json({ error: "Invalid Credentials" });
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.post("/userdata", (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(422).json({ error: "Token get giver please log in" });
  }
  const token = authorization.replace("Bearer ", "");
  console.log(token);

  jwt.verify(token, process.env.jWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(422).json({ error: "token unvalid" });
    }
    const { _id } = payload;
    User.findById(_id).then((userdata) => {
      res.status(200).send({ message: "User Found", user: userdata });
    });
  });
});

module.exports = router;
