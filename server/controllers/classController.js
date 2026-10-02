const YogaClass = require('../models/YogaClass');
const { paginate } = require('../utils/pagination');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
const getClasses = async (req, res, next) => {
  try {
    const { page, limit, type, difficulty, status, instructorId, date, search } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;
    if (instructorId) filter.instructorId = instructorId;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const result = await paginate(YogaClass, filter, {
      page,
      limit,
      sort: { date: 1, startTime: 1 },
      populate: { path: 'instructorId', select: 'name email avatar' },
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Public
const getClass = async (req, res, next) => {
  try {
    const yogaClass = await YogaClass.findById(req.params.id).populate(
      'instructorId',
      'name email avatar'
    );
    if (!yogaClass) return res.status(404).json({ success: false, message: 'Class not found.' });
    res.status(200).json({ success: true, data: yogaClass });
  } catch (error) {
    next(error);
  }
};

// @desc    Create class
// @route   POST /api/classes
// @access  Admin
const createClass = async (req, res, next) => {
  try {
    const yogaClass = await YogaClass.create(req.body);
    const populated = await yogaClass.populate('instructorId', 'name email avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Admin
const updateClass = async (req, res, next) => {
  try {
    const yogaClass = await YogaClass.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('instructorId', 'name email avatar');

    if (!yogaClass) return res.status(404).json({ success: false, message: 'Class not found.' });
    res.status(200).json({ success: true, data: yogaClass });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete class (soft delete)
// @route   DELETE /api/classes/:id
// @access  Admin
const deleteClass = async (req, res, next) => {
  try {
    const yogaClass = await YogaClass.findById(req.params.id);
    if (!yogaClass) return res.status(404).json({ success: false, message: 'Class not found.' });

    yogaClass.status = 'cancelled';
    await yogaClass.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Class cancelled successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's classes
// @route   GET /api/classes/today
// @access  Private
const getTodayClasses = async (req, res, next) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const classes = await YogaClass.find({
      date: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' },
    })
      .populate('instructorId', 'name email avatar')
      .sort({ startTime: 1 });

    res.status(200).json({ success: true, data: classes, count: classes.length });
  } catch (error) {
    next(error);
  }
};

module.exports = { getClasses, getClass, createClass, updateClass, deleteClass, getTodayClasses };
