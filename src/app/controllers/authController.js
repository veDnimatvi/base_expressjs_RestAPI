const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const validFunc = require("../../utils/validate");

const ENVIRONMENT = require("../environments/environment");
const ROLE = require("../constants/roles");
const REQUESTMESSAGE = require("../constants/requestMessage");

const authController = {
  login: async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).exec();

    if (!user) {
      res.status(403).json("UNAUTHORIZED");
    }

    const compare_pass = bcrypt.compareSync(req.body.password, user.password);

    if (!compare_pass) {
      res.status(403).json("UNAUTHORIZED");
    }

    if (user.valid) {
      const token = jwt.sign({ email: user.email }, ENVIRONMENT.SECRET_KEY, {
        expiresIn: "1d",
      });

      res.status(200).json({
        email: user.email,
        name: user.name,
        token,
      });
    } else {
      res.status(403).json("UNVERIFIED ACCOUNT");
    }
  },
  register: async (req, res) => {
    const userDto = req.body;

    try {
      if (!ROLE.includes(userDto.role)) {
        res.status(400).json(REQUESTMESSAGE.ROLE_INVALID);
      } else {
        const token = await jwt.sign(
          { email: userDto.email },
          ENVIRONMENT.SECRET_KEY,
          {
            expiresIn: "1d",
          }
        );

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: "587",
          service: false,
          auth: {
            user: ENVIRONMENT.MAIL_ADMIN,
            pass: ENVIRONMENT.PASS_MAIL_ADMIN,
          },
        });

        const mailOptions = {
          from: '"Company" <' + ENVIRONMENT.MAIL_ADMIN + ">",
          to: userDto.email, // list of receivers (separated by ,)
          subject: "Verify Email",
          text: "Verify Email",
          html:
            "Hi! <br><br> Thanks for your registration<br><br>" +
            "<a href=" +
            ENVIRONMENT.BASE_URL +
            "/api/v1/auth/email/verify/" +
            token +
            ">Click here to activate your account</a>", // html body
        };

        if (!validFunc.isValidEmail(userDto.email) && !userDto.password) {
          res.status(400).json(REQUESTMESSAGE.EMAIL_REGISTER_INVALID);
        } else {
          const userInDb = await User.findOne({
            email: userDto.email,
          }).exec();

          if (userInDb) {
            res.status(400).json(REQUESTMESSAGE.USER_ALREADY_EXISTS);
          } else {
            userDto.password = await bcrypt.hash(userDto.password, 10);
            await transporter.sendMail(mailOptions);
            User.create({ ...userDto, valid: false, codeReset: null });
            res.status(200).json({
              resgisted: true,
              message:
                "It may take 5 minutes to receive the email, please wait and check your email for verification !",
            });
          }
        }
      }
    } catch (error) {
      res.status(500).json(REQUESTMESSAGE.INTERNAL_SERVER_ERROR);
    }
  },
  verifyAccount: async (req, res) => {
    try {
      const info = JSON.parse(JSON.stringify(jwt.decode(req.params.token)));
      const user = await User.findOne({ email: info.email });
      if (user) {
        user.valid = true;
        user.save();
        res.json({
          verify: true,
        });
      }
    } catch (error) {
      res.status(500).json(REQUESTMESSAGE.INTERNAL_SERVER_ERROR);
    }
  },
  changePassword: async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.save();
      res.status(200).json({ updated: true });
    } else {
      res.status(200).json({ updated: false });
    }
  },
  resetPassword: async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).exec();

    if (user.codeReset === req.body.code) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.codeReset = null;
      user.save();
      res.status(200).json({
        updated: true,
      });
    } else {
      res.status(400).json(REQUESTMESSAGE.BAD_REQUEST);
    }
  },
  sendCodeResetPassword: async (req, res) => {
    const generateNumber = Math.floor(Math.random() * 9000000) + 1000000;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: "587",
      service: false,
      auth: {
        user: ENVIRONMENT.MAIL_ADMIN,
        pass: ENVIRONMENT.PASS_MAIL_ADMIN,
      },
    });

    const mailOptions = {
      from: '"Company" <' + ENVIRONMENT.MAIL_ADMIN + ">",
      to: req.body.email, // list of receivers (separated by ,)
      subject: "Reset Password Email",
      text: "Reset Password Email",
      html:
        "Hi! <br><br> Forgot your password?<br>We received a request to reset the password for your account.<br> Code reset is: <br><b>" +
        generateNumber +
        "</b><br>", // html body
    };

    try {
      const user = await User.findOne({ email: req.body.email }).exec();
      user.codeReset = generateNumber;
      user.save();
      await transporter.sendMail(mailOptions);
      res.status(200).json({
        send: true,
      });
    } catch (error) {
      res.status(500).json(REQUESTMESSAGE.INTERNAL_SERVER_ERROR);
    }
  },
};

module.exports = authController;
