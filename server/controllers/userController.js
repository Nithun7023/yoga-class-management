const User = require('../models/User');
const { paginate } = require('../utils/pagination');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, role, status, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const result = await paginate(User, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user (Admin)
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, dateOfBirth, gender, password, role, status } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, phone, dateOfBirth, gender, passwordHash: password, role, status });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, phone, dateOfBirth, gender, role, status, emergencyContact, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, dateOfBirth, gender, role, status, emergencyContact, avatar },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (soft deactivate or hard delete)
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Soft delete — set inactive instead of destroying history
    user.status = 'inactive';
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'User deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
