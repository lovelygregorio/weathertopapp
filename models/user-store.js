import { nanoid } from "nanoid";
// temporary storage for user accounts.
const _users = [];
// USER STORE- CRUD OPERATIONS
export const userStore = {

  // CREATE A NEW USER
  async create({ firstName, lastName, email, password }) {
    const user = {
      _id: nanoid(),                                   // unique ID for this user
      firstName: String(firstName || "").trim(),       // clean & store first name
      lastName: String(lastName || "").trim(),         // clean & store last name
      email: String(email || "").trim().toLowerCase(), // store lowercase email for consistency
      password: String(password || ""),                // store password as plain text
    };

    // save the user in memory
    _users.push(user);

    // return the created user so controllers can use it
    return user;
  },

  // FIND USER BY EMAIL
  async findByEmail(email) {
    return (
      _users.find(
        (user) => user.email === String(email || "").trim().toLowerCase()
      ) || null
    );
  },

  // FIND USER BY ID
  async findById(id) {
    return _users.find((user) => user._id === id) || null;
  },

  // UPDATE USER DETAILS
  async update(id, { firstName, lastName, email, password }) {
    // Find the existing user first
    const user = await this.findById(id);
    if (!user) return null; 

    // update only the provided fields and keep others unchanged
    if (firstName !== undefined) user.firstName = String(firstName).trim();
    if (lastName !== undefined) user.lastName = String(lastName).trim();
    if (email !== undefined) user.email = String(email).trim().toLowerCase();
    if (password !== undefined && password !== "") {
      user.password = String(password);
    }

    return user; // return updated user
  },
};
