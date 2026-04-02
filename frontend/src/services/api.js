import api from '../config/axios'; // Your axios config file

const courseService = {
  // ✅ Get all courses
  getAllCourses: (params = {}) => {
    return api.get('/courses', { params });
  },

  // ✅ Get single course by ID or slug
  getCourse: (id) => {
    console.log('🔍 Fetching course:', id);
    return api.get(`/courses/${id}`);
  },

  // ✅ CREATE course (working already)
  createCourse: (data) => {
    console.log('📝 Creating course:', data);
    return api.post('/courses', data);
  },

  // ✅ UPDATE course - FIX THIS ONE
  updateCourse: (courseId, data) => {
    console.log('🔄 UPDATING COURSE:');
    console.log('   ID:', courseId);
    console.log('   Data:', data);
    console.log('   URL:', `/courses/${courseId}`);
    
    return api.put(`/courses/${courseId}`, data);
  },

  // ✅ Delete course
  deleteCourse: (courseId) => {
    console.log('🗑️ Deleting course:', courseId);
    return api.delete(`/courses/${courseId}`);
  },

  // ✅ Toggle course status
  toggleCourseStatus: (courseId) => {
    console.log('🔄 Toggling course status:', courseId);
    return api.patch(`/courses/${courseId}/toggle-status`);
  },

  // ✅ Bulk update status
  bulkUpdateStatus: (courseIds, isActive) => {
    return api.put('/courses/bulk-status', { courseIds, isActive });
  },

  // ✅ Update course rating
  updateRating: (courseId, rating) => {
    return api.patch(`/courses/${courseId}/rating`, { rating });
  }
};

export default courseService;