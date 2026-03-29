// CourseForm.jsx (Create/Update with Enhanced UI)
import React, { useState } from 'react'
import { courseService } from '../../services'
import { COURSE_LEVELS, COURSE_DURATION_UNITS, CERTIFICATE_TYPES, PROJECT_DIFFICULTY } from '../common/courseConstants'


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
  const [activeTab, setActiveTab] = useState('basic')

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
    setLoading(true)
    
    try {
      // Calculate total projects
      formData.totalProjects = formData.projects.length
      
      if (course?._id) {
        await courseService.updateCourse(course._id, formData)
      } else {
        await courseService.createCourse(formData)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving course:', error)
      alert(error.response?.data?.message || 'Error saving course')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'content', label: 'Course Content' },
    { id: 'pricing', label: 'Pricing & Discount' },
    { id: 'media', label: 'Media & SEO' },
    { id: 'advanced', label: 'Advanced Settings' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!course?.code}
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated if left empty</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description (max 200 chars) *
            </label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows={3}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.shortDescription.length}/200 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Description *
            </label>
            <textarea
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Level *
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {Object.values(COURSE_LEVELS).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="duration.value"
                  value={formData.duration.value}
                  onChange={handleChange}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <select
                  name="duration.unit"
                  value={formData.duration.unit}
                  onChange={handleChange}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(COURSE_DURATION_UNITS).map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => handleArrayChange('tags', e.target.value)}
                placeholder="JavaScript, React, Node.js"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills to Learn (comma-separated)
            </label>
            <input
              type="text"
              value={formData.skillsToLearn.join(', ')}
              onChange={(e) => handleArrayChange('skillsToLearn', e.target.value)}
              placeholder="JavaScript, React, Node.js, MongoDB"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Course Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Syllabus Section */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Syllabus</h3>
              <button
                type="button"
                onClick={addSyllabusModule}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Add Module
              </button>
            </div>
            
            {formData.syllabus.map((module, moduleIndex) => (
              <div key={moduleIndex} className="mb-6 border-l-4 border-blue-500 pl-4">
                <div className="flex justify-between items-start mb-3">
                  <input
                    type="text"
                    placeholder="Module Name"
                    value={module.moduleName}
                    onChange={(e) => handleSyllabusChange(moduleIndex, 'moduleName', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeSyllabusModule(moduleIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                
                <textarea
                  placeholder="Module Description"
                  value={module.moduleDescription}
                  onChange={(e) => handleSyllabusChange(moduleIndex, 'moduleDescription', e.target.value)}
                  rows={2}
                  className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="mb-3">
                  <input
                    type="number"
                    placeholder="Module Duration (hours)"
                    value={module.moduleDuration}
                    onChange={(e) => handleSyllabusChange(moduleIndex, 'moduleDuration', parseInt(e.target.value))}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="ml-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Topics</h4>
                    <button
                      type="button"
                      onClick={() => addTopic(moduleIndex)}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      + Add Topic
                    </button>
                  </div>
                  
                  {module.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="mb-3 pl-4 border-l-2 border-gray-200">
                      <input
                        type="text"
                        placeholder="Topic Name"
                        value={topic.topicName}
                        onChange={(e) => handleTopicChange(moduleIndex, topicIndex, 'topicName', e.target.value)}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        placeholder="Topic Description"
                        value={topic.topicDescription}
                        onChange={(e) => handleTopicChange(moduleIndex, topicIndex, 'topicDescription', e.target.value)}
                        rows={2}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Duration (hours)"
                        value={topic.duration}
                        onChange={(e) => handleTopicChange(moduleIndex, topicIndex, 'duration', parseInt(e.target.value))}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Projects Section */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <button
                type="button"
                onClick={addProject}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Add Project
              </button>
            </div>
            
            {formData.projects.map((project, index) => (
              <div key={index} className="mb-4 border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={project.projectName}
                    onChange={(e) => handleProjectChange(index, 'projectName', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                
                <textarea
                  placeholder="Project Description"
                  value={project.projectDescription}
                  onChange={(e) => handleProjectChange(index, 'projectDescription', e.target.value)}
                  rows={2}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Technologies (comma-separated)"
                    value={project.technologiesUsed.join(', ')}
                    onChange={(e) => handleProjectChange(index, 'technologiesUsed', e.target.value.split(',').map(t => t.trim()))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={project.difficulty}
                    onChange={(e) => handleProjectChange(index, 'difficulty', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(PROJECT_DIFFICULTY).map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Duration (hours)"
                    value={project.duration}
                    onChange={(e) => handleProjectChange(index, 'duration', parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="url"
                    placeholder="GitHub Link"
                    value={project.githubLink}
                    onChange={(e) => handleProjectChange(index, 'githubLink', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Learning Outcomes, Prerequisites, etc. */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Learning Outcomes (one per line)
              </label>
              <textarea
                value={formData.learningOutcomes.join('\n')}
                onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value.split('\n').filter(l => l.trim()) })}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Build full-stack applications&#10;Understand MERN architecture&#10;Deploy to production"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prerequisites (one per line)
              </label>
              <textarea
                value={formData.prerequisites.join('\n')}
                onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value.split('\n').filter(p => p.trim()) })}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Basic HTML/CSS&#10;JavaScript fundamentals"
              />
            </div>
          </div>

          {/* Career Opportunities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Career Opportunities (one per line)
            </label>
            <textarea
              value={formData.careerOpportunities.join('\n')}
              onChange={(e) => setFormData({ ...formData, careerOpportunities: e.target.value.split('\n').filter(c => c.trim()) })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Frontend Developer&#10;Full Stack Developer&#10;React Developer"
            />
          </div>

          {/* FAQ Section */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">FAQ</h3>
              <button
                type="button"
                onClick={addFaq}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Add FAQ
              </button>
            </div>
            
            {formData.faqs.map((faq, index) => (
              <div key={index} className="mb-3 border rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <input
                    type="text"
                    placeholder="Question"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Fees (₹) *
              </label>
              <input
                type="number"
                name="totalFees"
                value={formData.totalFees}
                onChange={handleChange}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <input
                  type="checkbox"
                  name="installmentAllowed"
                  checked={formData.installmentAllowed}
                  onChange={handleChange}
                  className="mr-2"
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
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={formData.discount.isDiscounted}
                onChange={(e) => setFormData({
                  ...formData,
                  discount: { ...formData.discount, isDiscounted: e.target.checked }
                })}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Apply Discount</label>
            </div>

            {formData.discount.isDiscounted && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="discount.discountPercentage"
                    value={formData.discount.discountPercentage}
                    onChange={handleChange}
                    min={0}
                    max={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="datetime-local"
                    name="discount.validUntil"
                    value={formData.discount.validUntil}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {formData.discount.discountPercentage > 0 && (
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-800">
                      Discounted Price: ₹{(formData.totalFees - (formData.totalFees * formData.discount.discountPercentage / 100)).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Certificate</h3>
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                name="certificateProvided"
                checked={formData.certificateProvided}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Certificate Provided</label>
            </div>
            
            {formData.certificateProvided && (
              <div className="space-y-3">
                <select
                  name="certificateDetails.certificateType"
                  value={formData.certificateDetails.certificateType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  name="certificateDetails.validity"
                  placeholder="Validity"
                  value={formData.certificateDetails.validity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media & SEO Tab */}
      {activeTab === 'media' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail URL *
            </label>
            <input
              type="url"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {formData.thumbnail && (
              <img src={formData.thumbnail} alt="Thumbnail preview" className="mt-2 h-32 object-cover rounded" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Meta Title
            </label>
            <input
              type="text"
              name="seoMetadata.metaTitle"
              value={formData.seoMetadata.metaTitle}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Meta Description
            </label>
            <textarea
              name="seoMetadata.metaDescription"
              value={formData.seoMetadata.metaDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Advanced Settings Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="popularity.featured"
              checked={formData.popularity.featured}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Feature this course</label>
          </div>

          {formData.popularity.featured && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured Sort Order
              </label>
              <input
                type="number"
                name="popularity.sortOrder"
                value={formData.popularity.sortOrder}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eligibility Criteria (one per line)
            </label>
            <textarea
              value={formData.eligibilityCriteria.join('\n')}
              onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value.split('\n').filter(e => e.trim()) })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum 50% in 12th grade&#10;Basic computer knowledge"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What's Included (one per line)
            </label>
            <textarea
              value={formData.whatIncludes.join('\n')}
              onChange={(e) => setFormData({ ...formData, whatIncludes: e.target.value.split('\n').filter(w => w.trim()) })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Video lectures&#10;Downloadable resources&#10;Certificate of completion"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Features (one per line)
            </label>
            <textarea
              value={formData.features.join('\n')}
              onChange={(e) => setFormData({ ...formData, features: e.target.value.split('\n').filter(f => f.trim()) })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Live projects&#10;Industry expert instructors&#10;Career guidance"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Course Active (visible to users)</label>
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => onSuccess()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (course?._id ? 'Update Course' : 'Create Course')}
        </button>
      </div>
    </form>
  )
}

export default CourseForm