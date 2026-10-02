/**
 * Build a paginated query response.
 * @param {Model} model - Mongoose model
 * @param {Object} filter - query filter
 * @param {Object} options - { page, limit, sort, populate, select }
 */
const paginate = async (model, filter = {}, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  let query = model.find(filter).sort(sort).skip(skip).limit(limit);

  if (options.populate) {
    const populations = Array.isArray(options.populate) ? options.populate : [options.populate];
    populations.forEach((p) => {
      query = query.populate(p);
    });
  }

  if (options.select) {
    query = query.select(options.select);
  }

  const [data, total] = await Promise.all([query.exec(), model.countDocuments(filter)]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Parse common query params into a Mongoose filter object.
 */
const buildFilter = (query, allowedFields) => {
  const filter = {};
  allowedFields.forEach((field) => {
    if (query[field] !== undefined && query[field] !== '') {
      filter[field] = query[field];
    }
  });
  return filter;
};

module.exports = { paginate, buildFilter };
