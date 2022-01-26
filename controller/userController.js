const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { signToken } = require('../config/auth');
const { sendEmail } = require('../config/sendEmail')

const registerUser = async (req, res) => {
  try {
    const isAdded = await User.findOne({ email: req.body.email });
    if (isAdded) {
      res.status(401).send({
        message: 'This Email already Added!',
      });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: bcrypt.hashSync(req.body.password),
      });

      const user = await newUser.save();
      const token = signToken(user);
      res.send({
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const loginUser = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    const token = signToken(user);
    res.send({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      image: user.image,
    });
  } else {
    res.status(401).send({
      message: 'Invalid user or password!',
    });
  }
};

const changePassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user.password) {
    res.status(200).send({
      message: 'For change password,You need to sign in with email & password!',
    });
  } else if (
    user &&
    bcrypt.compareSync(req.body.currentPassword, user.password)
  ) {
    user.password = bcrypt.hashSync(req.body.newPassword);
    await user.save();
    res.status(200).send({
      message: 'Your password change successfully!',
    });
  } else {
    res.status(401).send({
      message: 'Invalid email or current password!',
    });
  }
};


const ForgetPasswordReq = async (req, res) => {
  try {

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {

      const token = await signToken(user);
      const url = `http://localhost:5055`;
      const link = `${url}/api/user/forget-password/${email}/${token}`

      await sendEmail(user.email,
        {
          subject: "Kharreedlo",
          text: "Forget Password",
          html: `<h4>Click on the link to change your password</h4><br>${link}`,
        }
      );

    }

    res.status(200).send({
      message: 'Email sent successfully!',
    });

  } catch (error) {
    res.status(500).send({
      message: error.message | "Network Error",
    });
  }
}

const forgetPasswordVerify = async (req, res) => {

  const { token, email } = req.params;
  // console.log(token, email);
  try {

    await jwt.verify(token, process.env.JWT_SECRET);
    res.status(301).redirect(
      `https://www.kharreedlo.com?forgetPassword=true&token=${token}&email=${email}`
    );

  } catch (error) {
    res.status(401).send({
      message: "Invalid Token"
    })
  }

};


const resetMyPasswords = async (req, res) => {
 
  const { email, token, newPassword } = req.body

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  if(!decoded){
    res.send({ message : "Invalid Token"})
  }

  const user = await User.findOne({ email })
  if (!user) {
    res.status(200).send({
      message: 'For change password,You need to sign in with email ',
    });
  }

  if (user) {
    newPassword = bcrypt.hashSync(req.body.newPassword);

    await User.findByIdAndUpdate(user._id, {
      password: newPassword
    })

    res.status(200).send({
      message: 'Your password change successfully!',
    });

  }
  else {
    res.status(401).send({
      message: 'Invalid email or current password!',
    });
  }
}



const signUpWithProvider = async (req, res) => {
  try {
    const isAdded = await User.findOne({ email: req.body.email });
    if (isAdded) {
      const token = signToken(isAdded);

      res.send({
        token,
        _id: isAdded._id,
        name: isAdded.name,
        email: isAdded.email,
        address: isAdded.address,
        phone: isAdded.phone,
        image: isAdded.image,
      });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        image: req.body.image,
      });

      const user = await newUser.save();
      const token = signToken(user);
      res.send({
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ _id: -1 });
    res.send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.send(user);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name;
      user.email = req.body.email;
      user.address = req.body.address;
      user.phone = req.body.phone;
      user.image = req.body.image;
      const updatedUser = await user.save();
      const token = signToken(updatedUser);
      res.send({
        token,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        address: updatedUser.address,
        phone: updatedUser.phone,
        image: updatedUser.image,
      });
    }
  } catch (err) {
    res.status(404).send({
      message: 'Your email is not valid!',
    });
  }
};

const deleteUser = (req, res) => {
  User.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send({
        message: err.message,
      });
    } else {
      res.status(200).send({
        message: 'User Deleted Successfully!',
      });
    }
  });
};

module.exports = {
  signUpWithProvider,
  registerUser,
  loginUser,
  changePassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  ForgetPasswordReq,
  forgetPasswordVerify,
  resetMyPasswords
};
