const bcrypt = require('bcryptjs');

const admins = [
  {
    userName: "SuperAdmin",
    password: bcrypt.hashSync('Qwerty@12'),
    roles: [
      "Admin"
    ],
    name: "Super Admin",
    image: "https://i.ibb.co/ZTWbx5z/team-1.jpg",
    address: "abc",
    country: "Pakistan",
    city: "Karachi",
    joiningData: new Date()
  },
];

module.exports = admins;
