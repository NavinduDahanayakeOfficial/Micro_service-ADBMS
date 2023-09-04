import User from "../model/User.js";

//*add a new user
export const createUser = async (req, res) => {
   try {
      const { name, email, phoneNumber, address } = req.body;

      const userExists = await User.findOne({ email });

      if (userExists) {
         return res.status(400).json({ error: "User already exists" });
      }

      const newUser = new User({ name, email, phoneNumber, address });
      const savedUser = await newUser.save();

      res.status(201).json(savedUser);
   } catch (error) {
      res.status(500).json({ error: "Error creating user" });
   }
};

//*get a user by id
export const getUser = async (req, res) => {
   try {
      const id = req.params.id;
      const user = await User.findById(id);
      if (!user) {
         return res.status(404).json({ error: "User not available" });
      }

      res.status(200).json(user);
   } catch (error) {
      res.status(404).json({ error: "Error retrieving user" });
   }
};

//*get all users
export const getUsers = async (req, res) => {
   try {
      const users = await User.find();
      if (!users) {
         return res.status(404).json({ error: "No users available" });
      }
      res.status(200).json(users);
   } catch (error) {
      res.status(500).json({ error: "Error retrieving users" });
   }
};

//*update a user
export const updateUser = async (req, res) => {
   try {
      const id = req.params.id;
      const user = await User.findById(id);

      if (!user) {
         return res.status(404).json({ error: "User not available" });
      }

      if (req.body.name) {
         user.name = req.body.name;
      }

      if (req.body.email) {
         user.email = req.body.email;
      }

      if (req.body.phoneNumber) {
         user.phoneNumber = req.body.phoneNumber;
      }

      if (req.body.address) {
         user.address = req.body.address;
      }

      const updatedUser = await user.save();
      res.status(200).json(updatedUser);
   } catch (error) {
      res.status(500).json({ error: "Error updating users" });
   }
};

//*delete a user
export const deleteUser = async (req, res) => {
   try {
      const id = req.params.id;
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
         return res.status(404).json({ error: "User not available" });
      }
      console.log(deletedUser.name + " deleted");
      res.status(204).json({ msg: "User deleted successfully" });
   } catch (error) {
      res.status(500).json({ error: "Error deleting user" });
   }
};
