import Counter from "../model/Counter.js";
import User from "../model/User.js";


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


//*get a user by mongodb userId
export const getUser = async (req, res) => {
   try {
      const userId = req.params.id;
      const user = await User.findOne({ userId });
      if (!user) {
         return res.status(404).json({ error: "User not available" });
      }

      res.status(200).json(user);
   } catch (error) {
      res.status(404).json({ error: "Error retrieving user" });
   }
};


//*add a new user
export const createUser = async (req, res) => {
   try {
      const { name, email, phoneNumber, address } = req.body;

      const userExists = await User.findOne({ email });

      if (userExists) {
         return res.status(400).json({ error: "User already exists" });
      }

      const counterData = await Counter.findOneAndUpdate(
         { id: "autoIncrementId" },
         { $inc: { sequence_value: 1 } },
         { new: true },
      );

      let userId;
      if(!counterData){
         const newCounter = new Counter({
            id:"autoIncrementId",
            sequence_value:1
         });

         await newCounter.save();

         userId = 1;
      }else{
         userId = counterData.sequence_value;
      }

      const newUser = new User({ userId, name, email, phoneNumber, address, numOfOrders:0 });
      const savedUser = await newUser.save();

      res.status(201).json(savedUser);
   } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error creating user" });
   }
};



//*update a user
export const updateUser = async (req, res) => {
   try {
      const userId = req.params.id;
      const user = await User.findOne({userId});

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


//* update numOfOrders property of a user
export const updateUserNumOfOrders = async (req, res) => {
   try {
      const userId = req.params.id;

      await User.findOneAndUpdate({userId},{$inc:{numOfOrders:1}});

      res.status(200).send();
   } catch (error) {
     
      res.status(500).json({ error: "Error updating users" });
   }
}


//*delete a user
export const deleteUser = async (req, res) => {
   try {
      const userId = req.params.id;
      const deletedUser = await User.findOneAndDelete({ userId });
      if (!deletedUser) {
         return res.status(404).json({ error: "User not available" });
      }
      console.log(deletedUser.name + " deleted");
      res.status(200).json({ message: "User deleted" });
   } catch (error) {
      res.status(500).json({ error: "Error deleting user" });
   }
};
