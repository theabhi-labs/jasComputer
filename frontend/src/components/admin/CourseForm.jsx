// CourseForm.jsx - Enhanced UI/UX with Multi-step Navigation & Animations
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { courseService } from '../../services'
import { COURSE_LEVELS, COURSE_DURATION_UNITS, CERTIFICATE_TYPES, PROJECT_DIFFICULTY } from '../common/courseConstants'

// Animation variants
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

const pageTransition = { type: 'tween', ease: 'easeInOut', duration: 0.3 }

// Tab Configuration with icons and descriptions
const tabs = [
  { id: 'basic', label: 'Basic Info', icon: '📋', description: 'Course name, category, description' },
  { id: 'content', label: 'Course Content', icon: '📚', description: 'Syllabus, projects, outcomes' },
  { id: 'pricing', label: 'Pricing & Discount', icon: '💰', description: 'Fees, installments, certificates' },
  { id: 'media', label: 'Media & SEO', icon: '🖼️', description: 'Thumbnail, SEO metadata' },
  { id: 'advanced', label: 'Advanced', icon: '⚙️', description: 'Features, eligibility, status' }
]

const CourseForm = ({ course, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    code: course?.code || '',
    shortDescription: course?.shortDescription || '',
    fullDescription: course?.fullDescription || '',
    thumbnail: course?.thumbnail || '',
    images: course?.images || [],
    duration: {
      value: course?.duration?.value || 3,
      unit: course?.duration?.unit || COURSE_DURATION_UNITS.MONTHS
    },
    totalFees: course?.totalFees || 0,
    installmentAllowed: course?.installmentAllowed !== undefined ? course.installmentAllowed : true,
    numberOfInstallments: course?.numberOfInstallments || 1,
    level: course?.level || COURSE_LEVELS.BEGINNER,
    skillsToLearn: course?.skillsToLearn || [],
    syllabus: course?.syllabus || [],
    careerOpportunities: course?.careerOpportunities || [],
    careerPaths: course?.careerPaths || [],
    certificateProvided: course?.certificateProvided !== undefined ? course.certificateProvided : true,
    certificateDetails: course?.certificateDetails || {
      certificateType: 'Digital',
      issuingAuthority: '',
      validity: '',
      additionalInfo: ''
    },
    projects: course?.projects || [],
    learningOutcomes: course?.learningOutcomes || [],
    prerequisites: course?.prerequisites || [],
    targetAudience: course?.targetAudience || [],
    language: course?.language || 'English',
    features: course?.features || [],
    benefits: course?.benefits || [],
    whatIncludes: course?.whatIncludes || [],
    faqs: course?.faqs || [],
    seoMetadata: course?.seoMetadata || {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      ogImage: ''
    },
    popularity: course?.popularity || {
      views: 0,
      enrollments: 0,
      featured: false,
      sortOrder: 0
    },
    discount: {
      isDiscounted: course?.discount?.isDiscounted || false,
      discountPercentage: course?.discount?.discountPercentage || 0,
      discountedPrice: course?.discount?.discountedPrice || 0,
      validUntil: course?.discount?.validUntil || ''
    },
    batches: course?.batches || [],
    instructors: course?.instructors || [],
    tags: course?.tags || [],
    category: course?.category || '',
    subcategory: course?.subcategory || '',
    eligibility: course?.eligibility || '',
    eligibilityCriteria: course?.eligibilityCriteria || [],
    isActive: course?.isActive !== undefined ? course.isActive : true
  })
  
  const [loading, setLoading] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [validationErrors, setValidationErrors] = useState({})

  // Validate current tab fields
  const validateCurrentTab = () => {
    const errors = {}
    const currentTabId = tabs[activeTabIndex].id

    if (currentTabId === 'basic') {
      if (!formData.name.trim()) errors.name = 'Course name is required'
      if (!formData.shortDescription.trim()) errors.shortDescription = 'Short description is required'
      if (!formData.fullDescription.trim()) errors.fullDescription = 'Full description is required'
      if (!formData.category.trim()) errors.category = 'Category is required'
      if (!formData.level) errors.level = 'Course level is required'
      if (!formData.duration.value || formData.duration.value <= 0) errors.duration = 'Valid duration is required'
    }

    if (currentTabId === 'content') {
      if (formData.syllabus.length === 0) errors.syllabus = 'At least one syllabus module is required'
      if (formData.learningOutcomes.length === 0) errors.learningOutcomes = 'At least one learning outcome is required'
    }

    if (currentTabId === 'pricing') {
      if (formData.totalFees <= 0) errors.totalFees = 'Total fees must be greater than 0'
      if (formData.installmentAllowed && formData.numberOfInstallments < 1) {
        errors.numberOfInstallments = 'Number of installments must be at least 1'
      }
    }

    if (currentTabId === 'media') {
      if (!formData.thumbnail.trim()) errors.thumbnail = 'Thumbnail URL is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentTab()) {
      setActiveTabIndex(prev => Math.min(prev + 1, tabs.length - 1))
    }
  }

  const handleBack = () => {
    setActiveTabIndex(prev => Math.max(prev - 1, 0))
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      })
    }
    // Clear error for this field if exists
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' })
    }
  }

  const handleArrayChange = (name, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item)
    setFormData({ ...formData, [name]: array })
  }

  const handleSyllabusChange = (index, field, value) => {
    const newSyllabus = [...formData.syllabus]
    newSyllabus[index][field] = value
    setFormData({ ...formData, syllabus: newSyllabus })
  }

  const addSyllabusModule = () => {
    setFormData({
      ...formData,
      syllabus: [
        ...formData.syllabus,
        {
          moduleName: '',
          moduleDescription: '',
          topics: [],
          moduleDuration: 0,
          order: formData.syllabus.length
        }
      ]
    })
  }

  const removeSyllabusModule = (index) => {
    const newSyllabus = formData.syllabus.filter((_, i) => i !== index)
    setFormData({ ...formData, syllabus: newSyllabus })
  }

  const addTopic = (moduleIndex) => {
    const newSyllabus = [...formData.syllabus]
    newSyllabus[moduleIndex].topics.push({
      topicName: '',
      topicDescription: '',
      duration: 0,
      resources: []
    })
    setFormData({ ...formData, syllabus: newSyllabus })
  }

  const handleTopicChange = (moduleIndex, topicIndex, field, value) => {
    const newSyllabus = [...formData.syllabus]
    newSyllabus[moduleIndex].topics[topicIndex][field] = value
    setFormData({ ...formData, syllabus: newSyllabus })
  }

  const handleProjectChange = (index, field, value) => {
    const newProjects = [...formData.projects]
    newProjects[index][field] = value
    setFormData({ ...formData, projects: newProjects })
  }

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [
        ...formData.projects,
        {
          projectName: '',
          projectDescription: '',
          technologiesUsed: [],
          difficulty: 'Intermediate',
          duration: 0,
          githubLink: '',
          demoLink: ''
        }
      ]
    })
  }

  const removeProject = (index) => {
    const newProjects = formData.projects.filter((_, i) => i !== index)
    setFormData({ ...formData, projects: newProjects })
  }

  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...formData.faqs]
    newFaqs[index][field] = value
    setFormData({ ...formData, faqs: newFaqs })
  }

  const addFaq = () => {
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: '', answer: '' }]
    })
  }

  const removeFaq = (index) => {
    const newFaqs = formData.faqs.filter((_, i) => i !== index)
    setFormData({ ...formData, faqs: newFaqs })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Final validation for all tabs before submit
    let isValid = true
    for (let i = 0; i < tabs.length; i++) {
      setActiveTabIndex(i)
      if (!validateCurrentTab()) {
        isValid = false
        break
      }
    }
    
    if (!isValid) {
      alert('Please fix all errors before submitting')
      return
    }

    setLoading(true)
    
    try {
      // Calculate total projects
      const submitData = { ...formData, totalProjects: formData.projects.length }
      
      if (course?._id) {
        await courseService.updateCourse(course._id, submitData)
      } else {
        await courseService.createCourse(submitData)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving course:', error)
      alert(error.response?.data?.message || 'Error saving course')
    } finally {
      setLoading(false)
    }
  }

  const currentTab = tabs[activeTabIndex]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Header with Visual Indicator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">{currentTab.icon}</span>
              {currentTab.label}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{currentTab.description}</p>
          </div>
          <div className="text-sm font-medium text-blue-600">
            Step {activeTabIndex + 1} of {tabs.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((activeTabIndex + 1) / tabs.length) * 100}%` }}
          />
        </div>
        
        {/* Tab Indicators */}
        <div className="flex justify-between mt-3">
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (validateCurrentTab()) setActiveTabIndex(idx)
              }}
              className={`text-xs font-medium transition-colors ${
                idx <= activeTabIndex ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTabIndex}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="min-h-[500px] bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          {/* Basic Info Tab */}
          {activeTabIndex === 0 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${
                      validationErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Full Stack Web Development"
                  />
                  {validationErrors.name && <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Course Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    disabled={!!course?.code}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generated if empty"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave empty for auto-generation</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  maxLength={200}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.shortDescription ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Brief description of the course (max 200 chars)"
                />
                <div className="flex justify-between mt-1">
                  {validationErrors.shortDescription && <p className="text-xs text-red-500">{validationErrors.shortDescription}</p>}
                  <p className="text-xs text-gray-400 ml-auto">{formData.shortDescription.length}/200 characters</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.fullDescription ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Detailed course description with key highlights"
                />
                {validationErrors.fullDescription && <p className="text-xs text-red-500 mt-1">{validationErrors.fullDescription}</p>}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Development, Design"
                  />
                  {validationErrors.category && <p className="text-xs text-red-500 mt-1">{validationErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Web Development"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Course Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(COURSE_LEVELS).map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Language
                  </label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., English, Hindi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      name="duration.value"
                      value={formData.duration.value}
                      onChange={handleChange}
                      className={`w-1/2 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.duration ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      min={1}
                    />
                    <select
                      name="duration.unit"
                      value={formData.duration.unit}
                      onChange={handleChange}
                      className="w-1/2 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.values(COURSE_DURATION_UNITS).map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  {validationErrors.duration && <p className="text-xs text-red-500 mt-1">{validationErrors.duration}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleArrayChange('tags', e.target.value)}
                    placeholder="JavaScript, React, Node.js"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Skills to Learn (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skillsToLearn.join(', ')}
                  onChange={(e) => handleArrayChange('skillsToLearn', e.target.value)}
                  placeholder="JavaScript, React, Node.js, MongoDB"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Course Content Tab */}
          {activeTabIndex === 1 && (
            <div className="space-y-6">
              {/* Syllabus Section */}
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <span>📖</span> Syllabus
                  </h3>
                  <button
                    type="button"
                    onClick={addSyllabusModule}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                  >
                    <span>+</span> Add Module
                  </button>
                </div>
                <div className="p-4 space-y-5 max-h-[500px] overflow-y-auto">
                  {formData.syllabus.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No modules added yet. Click "Add Module" to start building your syllabus.
                    </div>
                  )}
                  {formData.syllabus.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="border-l-4 border-blue-400 bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <input
                            type="text"
                            placeholder="Module Name"
                            value={module.moduleName}
                            onChange={(e) => handleSyllabusChange(moduleIndex, 'moduleName', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => removeSyllabusModule(moduleIndex)}
                            className="text-red-400 hover:text-red-600 text-sm px-2"
                          >
                            ✕ Remove
                          </button>
                        </div>
                        
                        <textarea
                          placeholder="Module Description"
                          value={module.moduleDescription}
                          onChange={(e) => handleSyllabusChange(moduleIndex, 'moduleDescription', e.target.value)}
                          rows={2}
                          className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        
                        <div className="mb-3">
                          <input
                            type="number"
                            placeholder="Module Duration (hours)"
                            value={module.moduleDuration}
                            onChange={(e) => handleSyllabusChange(moduleIndex, 'moduleDuration', parseInt(e.target.value) || 0)}
                            className="w-48 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-gray-600">Topics</h4>
                            <button
                              type="button"
                              onClick={() => addTopic(moduleIndex)}
                              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                            >
                              <span>+</span> Add Topic
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {module.topics.map((topic, topicIndex) => (
                              <div key={topicIndex} className="bg-gray-50 rounded-lg p-3">
                                <input
                                  type="text"
                                  placeholder="Topic Name"
                                  value={topic.topicName}
                                  onChange={(e) => handleTopicChange(moduleIndex, topicIndex, 'topicName', e.target.value)}
                                  className="w-full mb-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <textarea
                                  placeholder="Topic Description"
                                  value={topic.topicDescription}
                                  onChange={(e) => handleTopicChange(moduleIndex, topicIndex, 'topicDescription', e.target.value)}
                                  rows={2}
                                  className="w-full mb-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <input
                                  type="number"
                                  placeholder="Duration (hours)"
                                  value={topic.duration}
                                  onChange={(e) => handleTopicChange(moduleIndex, topicIndex, 'duration', parseInt(e.target.value) || 0)}
                                  className="w-40 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {validationErrors.syllabus && <p className="text-xs text-red-500 p-2 bg-red-50">{validationErrors.syllabus}</p>}
              </div>

              {/* Projects Section */}
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <span>🎯</span> Projects
                  </h3>
                  <button
                    type="button"
                    onClick={addProject}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    + Add Project
                  </button>
                </div>
                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                  {formData.projects.map((project, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <input
                          type="text"
                          placeholder="Project Name"
                          value={project.projectName}
                          onChange={(e) => handleProjectChange(index, 'projectName', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeProject(index)}
                          className="ml-3 text-red-400 hover:text-red-600"
                        >
                          ✕ Remove
                        </button>
                      </div>
                      
                      <textarea
                        placeholder="Project Description"
                        value={project.projectDescription}
                        onChange={(e) => handleProjectChange(index, 'projectDescription', e.target.value)}
                        rows={2}
                        className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Technologies (comma-separated)"
                          value={project.technologiesUsed.join(', ')}
                          onChange={(e) => handleProjectChange(index, 'technologiesUsed', e.target.value.split(',').map(t => t.trim()))}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <select
                          value={project.difficulty}
                          onChange={(e) => handleProjectChange(index, 'difficulty', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          {Object.values(PROJECT_DIFFICULTY).map(diff => (
                            <option key={diff} value={diff}>{diff}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          placeholder="Duration (hours)"
                          value={project.duration}
                          onChange={(e) => handleProjectChange(index, 'duration', parseInt(e.target.value) || 0)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="url"
                          placeholder="GitHub Link"
                          value={project.githubLink}
                          onChange={(e) => handleProjectChange(index, 'githubLink', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Learning Outcomes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.learningOutcomes.join('\n')}
                    onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value.split('\n').filter(l => l.trim()) })}
                    rows={5}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.learningOutcomes ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Build full-stack applications&#10;Understand MERN architecture&#10;Deploy to production"
                  />
                  {validationErrors.learningOutcomes && <p className="text-xs text-red-500 mt-1">{validationErrors.learningOutcomes}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Prerequisites
                  </label>
                  <textarea
                    value={formData.prerequisites.join('\n')}
                    onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value.split('\n').filter(p => p.trim()) })}
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Basic HTML/CSS&#10;JavaScript fundamentals"
                  />
                </div>
              </div>

              {/* FAQ Section */}
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <span>❓</span> Frequently Asked Questions
                  </h3>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    + Add FAQ
                  </button>
                </div>
                <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                  {formData.faqs.map((faq, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <input
                          type="text"
                          placeholder="Question"
                          value={faq.question}
                          onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                        />
                        <button
                          type="button"
                          onClick={() => removeFaq(index)}
                          className="text-red-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                      <textarea
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTabIndex === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Total Fees (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalFees"
                    value={formData.totalFees}
                    onChange={handleChange}
                    min={0}
                    step={100}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.totalFees ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.totalFees && <p className="text-xs text-red-500 mt-1">{validationErrors.totalFees}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <input
                      type="checkbox"
                      name="installmentAllowed"
                      checked={formData.installmentAllowed}
                      onChange={handleChange}
                      className="mr-2 rounded"
                    />
                    Installment Allowed
                  </label>
                  {formData.installmentAllowed && (
                    <input
                      type="number"
                      name="numberOfInstallments"
                      value={formData.numberOfInstallments}
                      onChange={handleChange}
                      min={1}
                      className={`mt-2 w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.numberOfInstallments ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  )}
                  {validationErrors.numberOfInstallments && <p className="text-xs text-red-500 mt-1">{validationErrors.numberOfInstallments}</p>}
                </div>
              </div>

              <div className="border rounded-xl p-5">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={formData.discount.isDiscounted}
                    onChange={(e) => setFormData({
                      ...formData,
                      discount: { ...formData.discount, isDiscounted: e.target.checked }
                    })}
                    className="mr-2 w-4 h-4"
                  />
                  <label className="text-sm font-semibold text-gray-700">Apply Discount</label>
                </div>

                <AnimatePresence>
                  {formData.discount.isDiscounted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Discount Percentage (%)
                        </label>
                        <input
                          type="number"
                          name="discount.discountPercentage"
                          value={formData.discount.discountPercentage}
                          onChange={handleChange}
                          min={0}
                          max={100}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Valid Until
                        </label>
                        <input
                          type="datetime-local"
                          name="discount.validUntil"
                          value={formData.discount.validUntil}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      {formData.discount.discountPercentage > 0 && formData.totalFees > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800 font-medium">
                            💰 Discounted Price: ₹{(formData.totalFees - (formData.totalFees * formData.discount.discountPercentage / 100)).toFixed(2)}
                          </p>
                          <p className="text-xs text-green-600 mt-1">You save ₹{(formData.totalFees * formData.discount.discountPercentage / 100).toFixed(2)}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border rounded-xl p-5">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🏆</span> Certificate
                </h3>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="certificateProvided"
                    checked={formData.certificateProvided}
                    onChange={handleChange}
                    className="mr-2 w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-700">Certificate Provided</label>
                </div>
                
                {formData.certificateProvided && (
                  <div className="space-y-3 pl-6">
                    <select
                      name="certificateDetails.certificateType"
                      value={formData.certificateDetails.certificateType}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.values(CERTIFICATE_TYPES).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    
                    <input
                      type="text"
                      name="certificateDetails.issuingAuthority"
                      placeholder="Issuing Authority"
                      value={formData.certificateDetails.issuingAuthority}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <input
                      type="text"
                      name="certificateDetails.validity"
                      placeholder="Validity (e.g., Lifetime, 2 Years)"
                      value={formData.certificateDetails.validity}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Media & SEO Tab */}
          {activeTabIndex === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Thumbnail URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.thumbnail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/course-thumbnail.jpg"
                />
                {validationErrors.thumbnail && <p className="text-xs text-red-500 mt-1">{validationErrors.thumbnail}</p>}
                {formData.thumbnail && (
                  <div className="mt-3">
                    <img src={formData.thumbnail} alt="Thumbnail preview" className="h-32 object-cover rounded-lg shadow-sm border" />
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🔍</span> SEO Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      SEO Meta Title
                    </label>
                    <input
                      type="text"
                      name="seoMetadata.metaTitle"
                      value={formData.seoMetadata.metaTitle}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Course title for search engines"
                    />
                    <p className="text-xs text-gray-400 mt-1">Recommended: 50-60 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      SEO Meta Description
                    </label>
                    <textarea
                      name="seoMetadata.metaDescription"
                      value={formData.seoMetadata.metaDescription}
                      onChange={handleChange}
                      rows={3}
                      maxLength={160}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description for search results"
                    />
                    <p className="text-xs text-gray-400 mt-1">{formData.seoMetadata.metaDescription.length}/160 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      SEO Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.seoMetadata.metaKeywords.join(', ')}
                      onChange={(e) => setFormData({
                        ...formData,
                        seoMetadata: {
                          ...formData.seoMetadata,
                          metaKeywords: e.target.value.split(',').map(k => k.trim())
                        }
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="web development, javascript, react, full stack"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings Tab */}
          {activeTabIndex === 4 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>⭐</span> Feature this course
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Featured courses appear prominently on the homepage</p>
                </div>
                <input
                  type="checkbox"
                  name="popularity.featured"
                  checked={formData.popularity.featured}
                  onChange={handleChange}
                  className="w-5 h-5 rounded"
                />
              </div>

              {formData.popularity.featured && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-xl"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Featured Sort Order
                  </label>
                  <input
                    type="number"
                    name="popularity.sortOrder"
                    value={formData.popularity.sortOrder}
                    onChange={handleChange}
                    min={0}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Eligibility Criteria (one per line)
                </label>
                <textarea
                  value={formData.eligibilityCriteria.join('\n')}
                  onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value.split('\n').filter(e => e.trim()) })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 50% in 12th grade&#10;Basic computer knowledge"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  What's Included (one per line)
                </label>
                <textarea
                  value={formData.whatIncludes.join('\n')}
                  onChange={(e) => setFormData({ ...formData, whatIncludes: e.target.value.split('\n').filter(w => w.trim()) })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Video lectures&#10;Downloadable resources&#10;Certificate of completion"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Features (one per line)
                </label>
                <textarea
                  value={formData.features.join('\n')}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value.split('\n').filter(f => f.trim()) })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Live projects&#10;Industry expert instructors&#10;Career guidance"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>👁️</span> Course Status
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Make course visible/invisible to users</p>
                </div>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded"
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons - Only Next/Back, Save only on last page */}
      <div className="flex justify-between pt-4 border-t">
        <button
          type="button"
          onClick={handleBack}
          disabled={activeTabIndex === 0}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTabIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span>←</span> Back
        </button>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onSuccess()}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          
          {activeTabIndex === tabs.length - 1 ? (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                course?._id ? 'Update Course' : 'Create Course'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              Next <span>→</span>
            </button>
          )}
        </div>
      </div>
    </form>
  )
}

export default CourseForm