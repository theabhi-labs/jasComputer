// CourseForm.jsx - Only useEffect section corrected
import React, { useState, useCallback, useEffect } from 'react'
import { courseService } from '../../services'
import { COURSE_LEVELS, COURSE_DURATION_UNITS, CERTIFICATE_TYPES, PROJECT_DIFFICULTY } from '../common/courseConstants'

const CourseForm = ({ course, onSuccess }) => {
  // Initialize form data with proper defaults
  const getInitialFormData = () => ({
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

  const [formData, setFormData] = useState(getInitialFormData)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [errors, setErrors] = useState({})

  // State for temporary input values
  const [tempTags, setTempTags] = useState('')
  const [tempSkills, setTempSkills] = useState('')
  const [tempMetaKeywords, setTempMetaKeywords] = useState('')

  // ✅ FIXED: Initialize temp values from course data - THIS IS THE ONLY CORRECTION
  useEffect(() => {
    if (course && Object.keys(course).length > 0) {
      console.log("📝 EDIT MODE - Full course data:", course);
      
      // 🔍 Debug: Check syllabus, projects, FAQs
      console.log("🔍 SYLLABUS DATA:", course.syllabus);
      console.log("🔍 PROJECTS DATA:", course.projects);
      console.log("🔍 FAQS DATA:", course.faqs);
      console.log("📊 Syllabus length:", course.syllabus?.length || 0);
      console.log("📊 Projects length:", course.projects?.length || 0);
      console.log("📊 FAQs length:", course.faqs?.length || 0);
      
      // Create fullDescription if missing
      let fullDesc = course.fullDescription;
      if (!fullDesc) {
        const descParts = [];
        if (course.name) descParts.push(course.name);
        if (course.shortDescription) descParts.push(course.shortDescription);
        if (course.skillsToLearn?.length) {
          descParts.push(`Skills you'll master: ${course.skillsToLearn.join(', ')}`);
        }
        if (course.learningOutcomes?.length) {
          descParts.push(`What you'll achieve: ${course.learningOutcomes.join(', ')}`);
        }
        if (course.careerOpportunities?.length) {
          descParts.push(`Career paths: ${course.careerOpportunities.join(', ')}`);
        }
        fullDesc = descParts.join('. ') || "Comprehensive course covering all essential topics with hands-on projects and expert guidance.";
        console.log("⚠️ Created fullDescription from available data");
      }
      
      // ✅ CRITICAL: Ensure syllabus, projects, faqs are properly set
      const syllabusData = Array.isArray(course.syllabus) ? course.syllabus : [];
      const projectsData = Array.isArray(course.projects) ? course.projects : [];
      const faqsData = Array.isArray(course.faqs) ? course.faqs : [];
      
      console.log("✅ Setting syllabus with:", syllabusData.length, "modules");
      console.log("✅ Setting projects with:", projectsData.length, "projects");
      console.log("✅ Setting FAQs with:", faqsData.length, "questions");
      
      setFormData({
        name: course.name || '',
        code: course.code || '',
        shortDescription: course.shortDescription || '',
        fullDescription: fullDesc,
        thumbnail: course.thumbnail || '',
        images: course.images || [],
        duration: {
          value: course.duration?.value || 3,
          unit: course.duration?.unit || COURSE_DURATION_UNITS.MONTHS
        },
        totalFees: course.totalFees || 0,
        installmentAllowed: course.installmentAllowed !== undefined ? course.installmentAllowed : true,
        numberOfInstallments: course.numberOfInstallments || 1,
        level: course.level || COURSE_LEVELS.BEGINNER,
        skillsToLearn: course.skillsToLearn || [],
        syllabus: syllabusData,  // ✅ Fixed
        careerOpportunities: course.careerOpportunities || [],
        careerPaths: course.careerPaths || [],
        certificateProvided: course.certificateProvided !== undefined ? course.certificateProvided : true,
        certificateDetails: course.certificateDetails || {
          certificateType: 'Digital',
          issuingAuthority: '',
          validity: '',
          additionalInfo: ''
        },
        projects: projectsData,  // ✅ Fixed
        learningOutcomes: course.learningOutcomes || [],
        prerequisites: course.prerequisites || [],
        targetAudience: course.targetAudience || [],
        language: course.language || 'English',
        features: course.features || [],
        benefits: course.benefits || [],
        whatIncludes: course.whatIncludes || [],
        faqs: faqsData,  // ✅ Fixed
        seoMetadata: course.seoMetadata || {
          metaTitle: '',
          metaDescription: '',
          metaKeywords: [],
          ogImage: ''
        },
        popularity: course.popularity || {
          views: 0,
          enrollments: 0,
          featured: false,
          sortOrder: 0
        },
        discount: {
          isDiscounted: course.discount?.isDiscounted || false,
          discountPercentage: course.discount?.discountPercentage || 0,
          discountedPrice: course.discount?.discountedPrice || 0,
          validUntil: course.discount?.validUntil || ''
        },
        batches: course.batches || [],
        instructors: course.instructors || [],
        tags: course.tags || [],
        category: course.category || '',
        subcategory: course.subcategory || '',
        eligibility: course.eligibility || '',
        eligibilityCriteria: course.eligibilityCriteria || [],
        isActive: course.isActive !== undefined ? course.isActive : true
      });

      setTempTags(course.tags?.join(', ') || '');
      setTempSkills(course.skillsToLearn?.join(', ') || '');
      setTempMetaKeywords(course.seoMetadata?.metaKeywords?.join(', ') || '');
    }
  }, [course]);

  // ... Rest of your code remains EXACTLY THE SAME ...
  // (All handlers, tabs, and return statement remain unchanged)
  
  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {}
    if (!formData.name?.trim()) newErrors.name = 'Course name is required'
    if (!formData.shortDescription?.trim()) newErrors.shortDescription = 'Short description is required'
    if (!formData.fullDescription?.trim()) newErrors.fullDescription = 'Full description is required'
    if (!formData.category?.trim()) newErrors.category = 'Category is required'
    if (!formData.thumbnail?.trim()) newErrors.thumbnail = 'Thumbnail URL is required'
    if (formData.totalFees < 0) newErrors.totalFees = 'Total fees must be greater than 0'

    if (formData.discount.isDiscounted) {
      if (formData.discount.discountPercentage <= 0 || formData.discount.discountPercentage > 100) {
        newErrors.discountPercentage = 'Discount percentage must be between 1 and 100'
      }
      if (!formData.discount.validUntil) {
        newErrors.discountValidUntil = 'Discount valid until date is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    let finalValue = type === 'checkbox' ? checked : value

    if (type === 'number' && finalValue !== '') {
      finalValue = parseFloat(finalValue)
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: finalValue
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: finalValue
      }))
    }
  }, [])

  // Tags handlers
  const handleTagsInput = (e) => setTempTags(e.target.value)
  
  const addTags = (input) => {
    const tagsArray = input.split(/\s+/).map(tag => tag.trim()).filter(tag => tag !== '')
    if (tagsArray.length === 0) return
    setFormData(prev => ({
      ...prev,
      tags: [...new Set([...prev.tags, ...tagsArray])]
    }))
    setTempTags('')
  }

  const handleTagsKeyDown = (e) => {
    const value = e.target.value
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      addTags(value)
    }
    if (e.key === 'Backspace' && value === '') {
      setFormData(prev => ({ ...prev, tags: prev.tags.slice(0, -1) }))
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  // Skills handlers
  const handleSkillsInput = (e) => setTempSkills(e.target.value)
  
  const addSkills = (input) => {
    const skillsArray = input.split(/\s+/).map(skill => skill.trim()).filter(skill => skill !== '')
    if (skillsArray.length === 0) return
    setFormData(prev => ({
      ...prev,
      skillsToLearn: [...new Set([...prev.skillsToLearn, ...skillsArray])]
    }))
    setTempSkills('')
  }

  const handleSkillsKeyDown = (e) => {
    const value = e.target.value
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      addSkills(value)
    }
    if (e.key === 'Backspace' && value === '') {
      setFormData(prev => ({ ...prev, skillsToLearn: prev.skillsToLearn.slice(0, -1) }))
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({ ...prev, skillsToLearn: prev.skillsToLearn.filter(skill => skill !== skillToRemove) }))
  }

  // Meta keywords handlers
  const handleMetaKeywordsChange = (e) => setTempMetaKeywords(e.target.value)
  
  const addKeywords = (input) => {
    const keywordsArray = input.split(',').map(k => k.trim()).filter(k => k !== '')
    if (keywordsArray.length === 0) return
    setFormData(prev => ({
      ...prev,
      seoMetadata: {
        ...prev.seoMetadata,
        metaKeywords: [...new Set([...(prev.seoMetadata.metaKeywords || []), ...keywordsArray])]
      }
    }))
    setTempMetaKeywords('')
  }

  const handleMetaKeywordsKeyDown = (e) => {
    const value = e.target.value
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault()
      addKeywords(value)
    }
    if (e.key === 'Backspace' && value === '') {
      setFormData(prev => ({
        ...prev,
        seoMetadata: {
          ...prev.seoMetadata,
          metaKeywords: prev.seoMetadata.metaKeywords.slice(0, -1)
        }
      }))
    }
  }

  const removeKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      seoMetadata: {
        ...prev.seoMetadata,
        metaKeywords: prev.seoMetadata.metaKeywords.filter(k => k !== keywordToRemove)
      }
    }))
  }

  // Textarea array handler
  const handleTextareaArrayChange = useCallback((fieldName, value) => {
    const array = value.split('\n').map(item => item.trim()).filter(item => item !== '')
    setFormData(prev => ({ ...prev, [fieldName]: array }))
  }, [])

  // Discount handlers
  const handleDiscountPercentageChange = useCallback((e) => {
    let numValue = parseFloat(e.target.value) || 0
    numValue = Math.min(100, Math.max(0, numValue))
    setFormData(prev => ({
      ...prev,
      discount: {
        ...prev.discount,
        discountPercentage: numValue,
        discountedPrice: numValue > 0 ? (prev.totalFees - (prev.totalFees * numValue / 100)) : 0
      }
    }))
  }, [])

  const handleTotalFeesChange = useCallback((e) => {
    const value = parseFloat(e.target.value) || 0
    setFormData(prev => ({
      ...prev,
      totalFees: value,
      discount: {
        ...prev.discount,
        discountedPrice: prev.discount.isDiscounted && prev.discount.discountPercentage > 0
          ? (value - (value * prev.discount.discountPercentage / 100))
          : 0
      }
    }))
  }, [])

  const handleDiscountToggle = useCallback((e) => {
    const isChecked = e.target.checked
    setFormData(prev => ({
      ...prev,
      discount: {
        ...prev.discount,
        isDiscounted: isChecked,
        discountPercentage: isChecked ? prev.discount.discountPercentage : 0,
        discountedPrice: isChecked && prev.discount.discountPercentage > 0
          ? (prev.totalFees - (prev.totalFees * prev.discount.discountPercentage / 100))
          : 0,
        validUntil: isChecked ? prev.discount.validUntil : ''
      }
    }))
  }, [])

  // Syllabus handlers
  const addSyllabusModule = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      syllabus: [...prev.syllabus, { moduleName: '', moduleDescription: '', topics: [], moduleDuration: 0, order: prev.syllabus.length }]
    }))
  }, [])

  const removeSyllabusModule = useCallback((index) => {
    setFormData(prev => ({ ...prev, syllabus: prev.syllabus.filter((_, i) => i !== index) }))
  }, [])

  const handleSyllabusChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newSyllabus = [...prev.syllabus]
      newSyllabus[index][field] = value
      return { ...prev, syllabus: newSyllabus }
    })
  }, [])

  const addTopic = useCallback((moduleIndex) => {
    setFormData(prev => {
      const newSyllabus = [...prev.syllabus]
      newSyllabus[moduleIndex].topics.push({ topicName: '', topicDescription: '', duration: 0, resources: [] })
      return { ...prev, syllabus: newSyllabus }
    })
  }, [])

  const removeTopic = useCallback((moduleIndex, topicIndex) => {
    setFormData(prev => {
      const newSyllabus = [...prev.syllabus]
      newSyllabus[moduleIndex].topics = newSyllabus[moduleIndex].topics.filter((_, i) => i !== topicIndex)
      return { ...prev, syllabus: newSyllabus }
    })
  }, [])

  // Project handlers
  const addProject = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { projectName: '', projectDescription: '', technologiesUsed: [], difficulty: 'Intermediate', duration: 0, githubLink: '', demoLink: '' }]
    }))
  }, [])

  const removeProject = useCallback((index) => {
    setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }))
  }, [])

  const handleProjectChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newProjects = [...prev.projects]
      newProjects[index][field] = value
      return { ...prev, projects: newProjects }
    })
  }, [])

  // FAQ handlers
  const addFaq = useCallback(() => {
    setFormData(prev => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }))
  }, [])

  const removeFaq = useCallback((index) => {
    setFormData(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }))
  }, [])

  const handleFaqChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newFaqs = [...prev.faqs]
      newFaqs[index][field] = value
      return { ...prev, faqs: newFaqs }
    })
  }, [])

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      alert('Please fill in all required fields correctly')
      return
    }

    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        thumbnail: formData.thumbnail,
        images: formData.images,
        duration: {
          value: Number(formData.duration.value),
          unit: formData.duration.unit
        },
        totalFees: Number(formData.totalFees),
        installmentAllowed: formData.installmentAllowed,
        numberOfInstallments: Number(formData.numberOfInstallments),
        level: formData.level,
        language: formData.language,
        skillsToLearn: formData.skillsToLearn || [],
        tags: formData.tags || [],
        learningOutcomes: formData.learningOutcomes || [],
        prerequisites: formData.prerequisites || [],
        careerOpportunities: formData.careerOpportunities || [],
        features: formData.features || [],
        benefits: formData.benefits || [],
        whatIncludes: formData.whatIncludes || [],
        eligibilityCriteria: formData.eligibilityCriteria || [],
        category: formData.category,
        subcategory: formData.subcategory,
        syllabus: formData.syllabus || [],
        projects: formData.projects || [],
        faqs: formData.faqs || [],
        certificateProvided: formData.certificateProvided,
        certificateDetails: formData.certificateDetails,
        seoMetadata: formData.seoMetadata,
        popularity: formData.popularity,
        discount: formData.discount.isDiscounted ? {
          isDiscounted: true,
          discountPercentage: Number(formData.discount.discountPercentage),
          discountedPrice: Number(formData.discount.discountedPrice),
          validUntil: formData.discount.validUntil
        } : {
          isDiscounted: false,
          discountPercentage: 0,
          discountedPrice: 0,
          validUntil: ''
        },
        isActive: formData.isActive,
        eligibility: formData.eligibility,
        targetAudience: formData.targetAudience,
        batches: formData.batches,
        instructors: formData.instructors
      }

      console.log("📊 SYLLABUS in payload:", payload.syllabus?.length);
      console.log("📊 PROJECTS in payload:", payload.projects?.length);
      console.log("📊 FAQS in payload:", payload.faqs?.length);

      let response
      if (course?._id) {
        console.log("🔄 UPDATING COURSE:", course._id)
        response = await courseService.updateCourse(course._id, payload)
        alert('Course updated successfully!')
      } else {
        console.log("🆕 CREATING NEW COURSE")
        response = await courseService.createCourse(payload)
        alert('Course created successfully!')
      }

      if (onSuccess) {
        onSuccess(response?.data || response)
      }
    } catch (error) {
      console.error('❌ Error saving course:', error)
      alert(error.response?.data?.message || 'Error saving course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getArrayAsString = useCallback((arr) => arr?.join('\n') || '', [])
  
  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'content', label: 'Course Content' },
    { id: 'pricing', label: 'Pricing & Discount' },
    { id: 'media', label: 'Media & SEO' },
    { id: 'advanced', label: 'Advanced Settings' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {course?._id && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            ✏️ Editing Course: <strong>{course.name}</strong> (Code: {course.code})
          </p>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`} required />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
              <input type="text" name="code" value={formData.code} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!course?.code} />
              <p className="text-xs text-gray-500 mt-1">{course?.code ? 'Course code cannot be changed after creation' : 'Auto-generated if left empty'}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
            <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange}
              rows={3} maxLength={200}
              className={`w-full px-3 py-2 border ${errors.shortDescription ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
            <textarea 
              name="fullDescription" 
              value={formData.fullDescription || ''}
              onChange={handleChange}
              rows={8}
              className={`w-full px-3 py-2 border ${errors.fullDescription ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <input type="text" name="subcategory" value={formData.subcategory} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Level *</label>
              <select name="level" value={formData.level} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                {Object.values(COURSE_LEVELS).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <input type="text" name="language" value={formData.language} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
              <div className="flex gap-2">
                <input type="number" name="duration.value" value={formData.duration.value} onChange={handleChange}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" min={1} required />
                <select name="duration.unit" value={formData.duration.unit} onChange={handleChange}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.values(COURSE_DURATION_UNITS).map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input type="text" value={tempTags} onChange={handleTagsInput} onKeyDown={handleTagsKeyDown}
                placeholder="JavaScript React Node.js"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-gray-500 mt-1">Press space or enter to add tags</p>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-blue-500 hover:text-red-500 font-bold">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills to Learn</label>
            <input type="text" value={tempSkills} onChange={handleSkillsInput} onKeyDown={handleSkillsKeyDown}
              placeholder="Type skill and press space or enter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-500 mt-1">Use space or Enter to add skills</p>
            {formData.skillsToLearn.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skillsToLearn.map((skill, idx) => (
                  <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-red-500 hover:text-red-700 ml-1">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Syllabus Section */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Syllabus ({formData.syllabus?.length || 0} modules)</h3>
              <button type="button" onClick={addSyllabusModule}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">+ Add Module</button>
            </div>
            {formData.syllabus?.map((module, moduleIndex) => (
              <div key={moduleIndex} className="mb-6 border-l-4 border-blue-500 pl-4">
                <div className="flex justify-between items-start mb-3">
                  <input type="text" placeholder="Module Name" value={module.moduleName}
                    onChange={(e) => handleSyllabusChange(moduleIndex, 'moduleName', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2" />
                  <button type="button" onClick={() => removeSyllabusModule(moduleIndex)}
                    className="text-red-500 hover:text-red-700">Remove</button>
                </div>
                <textarea placeholder="Module Description" value={module.moduleDescription}
                  onChange={(e) => handleSyllabusChange(moduleIndex, 'moduleDescription', e.target.value)}
                  rows={2} className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="ml-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Topics ({module.topics?.length || 0})</h4>
                    <button type="button" onClick={() => addTopic(moduleIndex)}
                      className="text-sm text-blue-500 hover:text-blue-700">+ Add Topic</button>
                  </div>
                  {module.topics?.map((topic, topicIndex) => (
                    <div key={topicIndex} className="mb-3 pl-4 border-l-2 border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <input type="text" placeholder="Topic Name" value={topic.topicName}
                          onChange={(e) => handleSyllabusChange(moduleIndex, topicIndex, 'topicName', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2" />
                        <button type="button" onClick={() => removeTopic(moduleIndex, topicIndex)}
                          className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                      </div>
                      <input type="number" placeholder="Duration (hours)" value={topic.duration}
                        onChange={(e) => handleSyllabusChange(moduleIndex, topicIndex, 'duration', parseInt(e.target.value) || 0)}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Projects Section */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Projects ({formData.projects?.length || 0})</h3>
              <button type="button" onClick={addProject}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">+ Add Project</button>
            </div>
            {formData.projects?.map((project, index) => (
              <div key={index} className="mb-4 border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <input type="text" placeholder="Project Name" value={project.projectName}
                    onChange={(e) => handleProjectChange(index, 'projectName', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={() => removeProject(index)}
                    className="ml-2 text-red-500 hover:text-red-700">Remove</button>
                </div>
                <textarea placeholder="Project Description" value={project.projectDescription}
                  onChange={(e) => handleProjectChange(index, 'projectDescription', e.target.value)}
                  rows={2} className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Duration (hours)" value={project.duration}
                    onChange={(e) => handleProjectChange(index, 'duration', parseInt(e.target.value) || 0)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select value={project.difficulty} onChange={(e) => handleProjectChange(index, 'difficulty', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.values(PROJECT_DIFFICULTY).map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Learning Outcomes & Prerequisites */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Learning Outcomes (one per line)</label>
              <textarea value={getArrayAsString(formData.learningOutcomes)}
                onChange={(e) => handleTextareaArrayChange('learningOutcomes', e.target.value)}
                rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Build full-stack applications&#10;Understand MERN architecture" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites (one per line)</label>
              <textarea value={getArrayAsString(formData.prerequisites)}
                onChange={(e) => handleTextareaArrayChange('prerequisites', e.target.value)}
                rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Basic HTML/CSS&#10;JavaScript fundamentals" />
            </div>
          </div>

          {/* Career Opportunities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Career Opportunities (one per line)</label>
            <textarea value={getArrayAsString(formData.careerOpportunities)}
              onChange={(e) => handleTextareaArrayChange('careerOpportunities', e.target.value)}
              rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Frontend Developer&#10;Full Stack Developer" />
          </div>

          {/* FAQ Section */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">FAQ ({formData.faqs?.length || 0})</h3>
              <button type="button" onClick={addFaq}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">+ Add FAQ</button>
            </div>
            {formData.faqs?.map((faq, index) => (
              <div key={index} className="mb-3 border rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <input type="text" placeholder="Question" value={faq.question}
                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2" />
                  <button type="button" onClick={() => removeFaq(index)}
                    className="text-red-500 hover:text-red-700">Remove</button>
                </div>
                <textarea placeholder="Answer" value={faq.answer}
                  onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                  rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Fees (₹) *</label>
              <input type="number" value={formData.totalFees} onChange={handleTotalFeesChange}
                min={0} step={1}
                className={`w-full px-3 py-2 border ${errors.totalFees ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <input type="checkbox" name="installmentAllowed" checked={formData.installmentAllowed} onChange={handleChange} className="mr-2" />
                Installment Allowed
              </label>
              {formData.installmentAllowed && (
                <input type="number" name="numberOfInstallments" value={formData.numberOfInstallments} onChange={handleChange}
                  min={1} className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <input type="checkbox" checked={formData.discount.isDiscounted} onChange={handleDiscountToggle} className="mr-2" />
              <label className="text-sm font-medium text-gray-700">Apply Discount</label>
            </div>
            {formData.discount.isDiscounted && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                  <input type="number" value={formData.discount.discountPercentage} onChange={handleDiscountPercentageChange}
                    min={0} max={100} step={1}
                    className={`w-full px-3 py-2 border ${errors.discountPercentage ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input type="datetime-local" name="discount.validUntil" value={formData.discount.validUntil?.split('T')[0] + 'T' + (formData.discount.validUntil?.split('T')[1]?.slice(0, 5) || '')} onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.discountValidUntil ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                </div>
                {formData.discount.discountPercentage > 0 && formData.totalFees > 0 && (
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-800">Discounted Price: ₹{(formData.totalFees - (formData.totalFees * formData.discount.discountPercentage / 100)).toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Certificate</h3>
            <div className="flex items-center mb-3">
              <input type="checkbox" name="certificateProvided" checked={formData.certificateProvided} onChange={handleChange} className="mr-2" />
              <label className="text-sm font-medium text-gray-700">Certificate Provided</label>
            </div>
            {formData.certificateProvided && (
              <div className="space-y-3">
                <select name="certificateDetails.certificateType" value={formData.certificateDetails.certificateType} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.values(CERTIFICATE_TYPES).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input type="text" name="certificateDetails.issuingAuthority" placeholder="Issuing Authority"
                  value={formData.certificateDetails.issuingAuthority} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" name="certificateDetails.validity" placeholder="Validity"
                  value={formData.certificateDetails.validity} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media & SEO Tab */}
      {activeTab === 'media' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL *</label>
            <input type="url" name="thumbnail" value={formData.thumbnail} onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.thumbnail ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`} required />
            {formData.thumbnail && (
              <img src={formData.thumbnail} alt="Thumbnail preview" className="mt-2 h-32 object-cover rounded" onError={(e) => e.target.style.display = 'none'} />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Meta Title</label>
            <input type="text" name="seoMetadata.metaTitle" value={formData.seoMetadata.metaTitle} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Meta Description</label>
            <textarea name="seoMetadata.metaDescription" value={formData.seoMetadata.metaDescription} onChange={handleChange}
              rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
            <input type="text" value={tempMetaKeywords} onChange={handleMetaKeywordsChange} onKeyDown={handleMetaKeywordsKeyDown}
              placeholder="Type and press comma or enter"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <p className="text-xs text-gray-500 mt-1">Press comma or Enter to add keywords</p>
            {formData.seoMetadata.metaKeywords?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.seoMetadata.metaKeywords.map((kw, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {kw}
                    <button type="button" onClick={() => removeKeyword(kw)} className="ml-1 text-purple-500 hover:text-red-500">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
            <input type="url" name="seoMetadata.ogImage" value={formData.seoMetadata.ogImage} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      )}

      {/* Advanced Settings Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <div className="flex items-center">
            <input type="checkbox" name="popularity.featured" checked={formData.popularity.featured} onChange={handleChange} className="mr-2" />
            <label className="text-sm font-medium text-gray-700">Feature this course</label>
          </div>
          {formData.popularity.featured && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Sort Order</label>
              <input type="number" name="popularity.sortOrder" value={formData.popularity.sortOrder} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria (one per line)</label>
            <textarea value={getArrayAsString(formData.eligibilityCriteria)}
              onChange={(e) => handleTextareaArrayChange('eligibilityCriteria', e.target.value)}
              rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What's Included (one per line)</label>
            <textarea value={getArrayAsString(formData.whatIncludes)}
              onChange={(e) => handleTextareaArrayChange('whatIncludes', e.target.value)}
              rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Features (one per line)</label>
            <textarea value={getArrayAsString(formData.features)}
              onChange={(e) => handleTextareaArrayChange('features', e.target.value)}
              rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex items-center">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="mr-2" />
            <label className="text-sm font-medium text-gray-700">Course Active (visible to users)</label>
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button type="button" onClick={() => onSuccess?.()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50">
          {loading ? 'Saving...' : (course?._id ? 'Update Course' : 'Create Course')}
        </button>
      </div>
    </form>
  )
}

export default CourseForm