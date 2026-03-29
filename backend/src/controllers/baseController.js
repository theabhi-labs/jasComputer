// Base controller with common utility functions
class BaseController {
  // Success response
  success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Error response
  error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  // Pagination metadata
  getPaginationMetadata(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }

  // Get pagination options from query
  getPaginationOptions(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  // Get sort options from query
  getSortOptions(query, defaultSort = '-createdAt') {
    const sortField = query.sortBy || defaultSort;
    const sortOrder = query.order === 'asc' ? 1 : -1;
    return { [sortField.replace('-', '')]: sortOrder };
  }

  // Get search filter
  getSearchFilter(searchFields, searchTerm) {
    if (!searchTerm) return {};
    return {
      $or: searchFields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' }
      }))
    };
  }
}

export default BaseController;