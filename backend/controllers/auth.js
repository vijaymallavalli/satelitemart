import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  // Check if the user already exists
  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [req.body.email], (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (data.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // If the user does not exist, create a new user
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const insertQuery =
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    const values = [
      req.body.name,
      req.body.email,
      hashedPassword,
      req.body.role || 'user', // Default role to 'user' if not provided
    ];

    db.query(insertQuery, values, (insertErr) => {
      if (insertErr) {
        return res.status(500).json({ error: 'User registration failed' });
      }

      return res.status(200).json({ message: 'User has been registered successfully' });
    });
  });
};


// export const login = (req, res) => {
//   const q = "SELECT * FROM users WHERE email = ?";

//   db.query(q, [req.body.email], (err, data) => {
//     if (err) return res.status(500).json(err);
//     if (data.length === 0) return res.status(404).json("email not found!");

//     const checkPassword = bcrypt.compareSync(
//       req.body.password,
//       data[0].password
//     );

//     if (!checkPassword)
//       return res.status(400).json("Wrong password or username!");

//     const token = jwt.sign({ id: data[0].id }, "secretkey");

//     const { password, ...others} = data[0];

//     res.cookie("accessToken", token, {
//         httpOnly: true,
//       })
//       .status(200)
//       .json(others);
//   });
// };
export const login = (req, res) => {
  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Email not found!");

    const checkPassword = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!checkPassword)
      return res.status(400).json("Wrong password or username!");

    // Assuming you have a 'role' field in your user data
    const userRole = data[0].role;

    const token = jwt.sign({ id: data[0].id }, "secretkey");

    const { password, ...others } = data[0];

    res.cookie("accessToken", token, {
      httpOnly: true,
    });

    // Set a 'userRole' cookie based on the user's role
    res.cookie("userRole", userRole, {
      httpOnly: true,
    });
    

    res.status(200).json(others);
  });
};

export const logout = (req, res) => {
  res.clearCookie("accessToken",{
    secure:true,
    sameSite:"none"
  }).status(200).json("User has been logged out.")
};
 
export const checkDate = (req, res) => {
  const enteredDate = req.params.date;

  const sql = 'SELECT COUNT(*) AS count FROM products WHERE entered_date = ?';

  db.query(sql, [enteredDate], (err, result) => {
    if (err) {
      console.error('Error checking date:', err);
      res.status(500).json({ error: 'Error checking date' });
    } else {
      const dateExists = result[0].count > 0;


      if (dateExists) {
        res.status(200).json({message:false})
      } else {
        res.status(200).json({message:true });
      }
    }
  });
};
