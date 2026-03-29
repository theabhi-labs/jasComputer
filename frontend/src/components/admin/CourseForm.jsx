// CourseForm.jsx — Enhanced UI/UX
import React, { useState, useEffect, useRef } from 'react'

// ─── Mock constants (replace with your actual imports) ───────────────────────
const COURSE_LEVELS = { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced' }
const COURSE_DURATION_UNITS = { HOURS: 'Hours', DAYS: 'Days', WEEKS: 'Weeks', MONTHS: 'Months' }
const CERTIFICATE_TYPES = { DIGITAL: 'Digital', PHYSICAL: 'Physical', BOTH: 'Both' }
const PROJECT_DIFFICULTY = { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced' }

// ─── Inline Styles (CSS-in-JS for portability) ───────────────────────────────
const injectStyles = () => {
  if (document.getElementById('cf-styles')) return
  const style = document.createElement('style')
  style.id = 'cf-styles'
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

    :root {
      --cf-bg: #f4f6fb;
      --cf-surface: #ffffff;
      --cf-surface2: #f0f3fa;
      --cf-border: rgba(0,0,0,0.09);
      --cf-border-focus: rgba(59,130,246,0.5);
      --cf-text: #1a202c;
      --cf-muted: #64748b;
      --cf-accent: #3b82f6;
      --cf-accent2: #f59e0b;
      --cf-danger: #ef4444;
      --cf-success: #22c55e;
      --cf-radius: 12px;
      --cf-radius-sm: 8px;
      --cf-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }

    .cf-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

    .cf-wrap {
      font-family: 'DM Sans', sans-serif;
      background: var(--cf-bg);
      color: var(--cf-text);
      min-height: 100vh;
      padding: 0;
    }

    /* ── Header ── */
    .cf-header {
      background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
      border-bottom: 1px solid var(--cf-border);
      padding: 28px 36px 0;
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(12px);
    }

    .cf-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .cf-title {
      font-family: 'Syne', sans-serif;
      font-size: 22px;
      font-weight: 800;
      background: linear-gradient(135deg, #1a202c 30%, var(--cf-accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.3px;
    }

    .cf-badge {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 20px;
      background: rgba(59,130,246,0.1);
      color: #2563eb;
      border: 1px solid rgba(59,130,246,0.22);
    }

    /* ── Tabs ── */
    .cf-tabs {
      display: flex;
      gap: 2px;
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 0;
    }
    .cf-tabs::-webkit-scrollbar { display: none; }

    .cf-tab {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 10px 18px;
      border: none;
      background: transparent;
      color: var(--cf-muted);
      font-family: 'DM Sans', sans-serif;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      white-space: nowrap;
      position: relative;
    }

    .cf-tab:hover { color: var(--cf-text); }

    .cf-tab.active {
      color: var(--cf-accent);
      border-bottom-color: var(--cf-accent);
      background: rgba(99,179,237,0.06);
    }

    .cf-tab-icon {
      width: 16px;
      height: 16px;
      opacity: 0.7;
    }

    .cf-tab.active .cf-tab-icon { opacity: 1; }

    .cf-tab-count {
      font-size: 10px;
      background: rgba(59,130,246,0.12);
      color: #2563eb;
      border-radius: 10px;
      padding: 1px 6px;
      min-width: 18px;
      text-align: center;
    }

    /* ── Body ── */
    .cf-body {
      padding: 32px 36px;
      max-width: 100%;
    }

    /* ── Tab Panels ── */
    .cf-panel {
      animation: cfSlideIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes cfSlideIn {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Section cards ── */
    .cf-section {
      background: var(--cf-surface);
      border: 1px solid var(--cf-border);
      border-radius: var(--cf-radius);
      padding: 24px;
      margin-bottom: 20px;
      transition: border-color 0.2s;
    }

    .cf-section:hover { border-color: rgba(255,255,255,0.13); }

    .cf-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--cf-border);
    }

    .cf-section-title {
      font-family: 'Syne', sans-serif;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.3px;
      color: var(--cf-text);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cf-section-title::before {
      content: '';
      display: block;
      width: 3px;
      height: 16px;
      background: var(--cf-accent);
      border-radius: 2px;
    }

    /* ── Grid ── */
    .cf-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .cf-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    @media (max-width: 768px) {
      .cf-header { padding: 20px 18px 0; }
      .cf-body { padding: 20px 18px; }
      .cf-grid-2, .cf-grid-3 { grid-template-columns: 1fr; }
      .cf-tab { padding: 9px 12px; font-size: 12.5px; }
    }

    /* ── Field ── */
    .cf-field { display: flex; flex-direction: column; gap: 6px; }

    .cf-label {
      font-size: 11.5px;
      font-weight: 600;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: var(--cf-muted);
    }

    .cf-label span { color: var(--cf-accent2); margin-left: 2px; }

    .cf-input, .cf-select, .cf-textarea {
      width: 100%;
      background: var(--cf-surface2);
      border: 1.5px solid var(--cf-border);
      border-radius: var(--cf-radius-sm);
      color: var(--cf-text);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      padding: 10px 14px;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      outline: none;
      -webkit-appearance: none;
      appearance: none;
    }

    .cf-input::placeholder, .cf-textarea::placeholder { color: rgba(107,122,158,0.6); }

    .cf-input:focus, .cf-select:focus, .cf-textarea:focus {
      border-color: var(--cf-border-focus);
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
    }

    .cf-input:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .cf-select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7a9e' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 36px;
      cursor: pointer;
    }

    .cf-select option { background: #ffffff; color: #1a202c; }

    .cf-textarea { resize: vertical; min-height: 90px; line-height: 1.6; }

    .cf-hint {
      font-size: 11px;
      color: var(--cf-muted);
      margin-top: 2px;
    }

    /* ── Checkbox ── */
    .cf-checkbox-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
    }

    .cf-checkbox {
      width: 18px;
      height: 18px;
      border-radius: 5px;
      border: 1.5px solid var(--cf-border);
      background: var(--cf-surface2);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: background 0.18s, border-color 0.18s;
      flex-shrink: 0;
      position: relative;
    }

    .cf-checkbox:checked {
      background: var(--cf-accent);
      border-color: var(--cf-accent);
    }

    .cf-checkbox:checked::after {
      content: '';
      position: absolute;
      left: 4px; top: 1.5px;
      width: 6px; height: 10px;
      border: 2px solid white;
      border-top: none;
      border-left: none;
      transform: rotate(45deg);
    }

    .cf-checkbox-label {
      font-size: 13.5px;
      color: var(--cf-text);
      font-weight: 400;
    }

    /* ── Buttons ── */
    .cf-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 18px;
      border-radius: var(--cf-radius-sm);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      text-decoration: none;
    }

    .cf-btn:active { transform: scale(0.97); }

    .cf-btn-primary {
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: white;
      box-shadow: 0 2px 12px rgba(37,99,235,0.3);
    }

    .cf-btn-primary:hover {
      background: linear-gradient(135deg, #1d4ed8, #2563eb);
      box-shadow: 0 4px 20px rgba(37,99,235,0.4);
      transform: translateY(-1px);
    }

    .cf-btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .cf-btn-ghost {
      background: transparent;
      color: var(--cf-muted);
      border: 1.5px solid var(--cf-border);
    }

    .cf-btn-ghost:hover {
      border-color: rgba(255,255,255,0.2);
      color: var(--cf-text);
      background: rgba(255,255,255,0.04);
    }

    .cf-btn-add {
      background: rgba(59,130,246,0.06);
      color: var(--cf-accent);
      border: 1.5px dashed rgba(59,130,246,0.35);
      width: 100%;
      justify-content: center;
      padding: 10px;
      margin-top: 8px;
      border-radius: var(--cf-radius-sm);
    }

    .cf-btn-add:hover {
      background: rgba(59,130,246,0.12);
      border-color: rgba(59,130,246,0.55);
    }

    .cf-btn-danger {
      background: rgba(252,129,129,0.1);
      color: var(--cf-danger);
      border: 1px solid rgba(252,129,129,0.25);
      padding: 5px 10px;
      font-size: 12px;
      border-radius: 6px;
    }

    .cf-btn-danger:hover {
      background: rgba(252,129,129,0.18);
    }

    .cf-btn-icon {
      padding: 6px;
      border-radius: 6px;
    }

    .cf-btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    /* ── Inline Duration ── */
    .cf-duration-wrap { display: flex; gap: 10px; }
    .cf-duration-wrap .cf-input { flex: 1; }
    .cf-duration-wrap .cf-select { flex: 1.4; }

    /* ── Module / FAQ cards ── */
    .cf-module {
      background: #f8faff;
      border: 1px solid var(--cf-border);
      border-left: 3px solid var(--cf-accent);
      border-radius: var(--cf-radius-sm);
      padding: 16px;
      margin-bottom: 14px;
      animation: cfSlideIn 0.22s ease both;
    }

    .cf-topic {
      background: #eef3ff;
      border: 1px solid rgba(59,130,246,0.12);
      border-left: 2px solid rgba(59,130,246,0.4);
      border-radius: 6px;
      padding: 12px;
      margin-top: 10px;
      animation: cfSlideIn 0.2s ease both;
    }

    .cf-project-card {
      background: #f8faff;
      border: 1px solid var(--cf-border);
      border-radius: var(--cf-radius-sm);
      padding: 16px;
      margin-bottom: 12px;
      animation: cfSlideIn 0.22s ease both;
    }

    .cf-faq-card {
      background: #f8faff;
      border: 1px solid var(--cf-border);
      border-radius: var(--cf-radius-sm);
      padding: 14px;
      margin-bottom: 10px;
      animation: cfSlideIn 0.2s ease both;
    }

    /* ── Discount / info highlight ── */
    .cf-infobox {
      background: rgba(59,130,246,0.07);
      border: 1px solid rgba(59,130,246,0.2);
      border-radius: var(--cf-radius-sm);
      padding: 12px 16px;
      margin-top: 10px;
    }

    .cf-infobox p { font-size: 14px; color: #2563eb; font-weight: 500; }

    .cf-infobox-warn {
      background: rgba(245,158,11,0.07);
      border-color: rgba(245,158,11,0.2);
    }

    .cf-infobox-warn p { color: #d97706; }

    /* ── Footer ── */
    .cf-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 36px;
      border-top: 1px solid var(--cf-border);
      background: #ffffff;
      position: sticky;
      bottom: 0;
      z-index: 40;
      flex-wrap: wrap;
      gap: 12px;
      box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
    }

    @media (max-width: 768px) {
      .cf-footer { padding: 16px 18px; }
    }

    .cf-footer-left { display: flex; align-items: center; gap: 10px; }

    /* ── Thumbnail preview ── */
    .cf-thumb-preview {
      margin-top: 10px;
      border-radius: var(--cf-radius-sm);
      overflow: hidden;
      border: 1px solid var(--cf-border);
      max-width: 260px;
      animation: cfSlideIn 0.2s ease both;
    }

    .cf-thumb-preview img {
      width: 100%;
      height: 140px;
      object-fit: cover;
      display: block;
    }

    /* ── char counter ── */
    .cf-counter {
      font-size: 11px;
      color: var(--cf-muted);
      text-align: right;
      margin-top: 3px;
    }

    .cf-counter.warn { color: var(--cf-accent2); }
    .cf-counter.over  { color: var(--cf-danger); }

    /* ── Loading spinner ── */
    @keyframes cfSpin { to { transform: rotate(360deg); } }
    .cf-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: cfSpin 0.7s linear infinite;
      flex-shrink: 0;
    }

    /* ── Toggle pill ── */
    .cf-toggle-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--cf-surface2);
      border: 1.5px solid var(--cf-border);
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.18s;
      width: fit-content;
    }

    .cf-toggle-wrap:hover { border-color: rgba(255,255,255,0.18); }
  `
  document.head.appendChild(style)
}

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icon = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const icons = {
  basic:    'M3 7h18M3 12h18M3 17h10',
  content:  'M4 6h16M4 10h16M4 14h8',
  pricing:  'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  media:    'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7',
  advanced: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  plus:     'M12 5v14M5 12h14',
  trash:    'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  check:    'M20 6L9 17l-5-5',
}

// ─── Reusable Field Components ────────────────────────────────────────────────
const Field = ({ label, required, hint, children }) => (
  <div className="cf-field">
    {label && (
      <label className="cf-label">
        {label}{required && <span>*</span>}
      </label>
    )}
    {children}
    {hint && <p className="cf-hint">{hint}</p>}
  </div>
)

const CheckRow = ({ label, name, checked, onChange, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <label className="cf-toggle-wrap">
      <input type="checkbox" className="cf-checkbox" name={name} checked={checked} onChange={onChange} />
      <span className="cf-checkbox-label">{label}</span>
    </label>
    {checked && children}
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const CourseForm = ({ course, onSuccess }) => {
  useEffect(() => { injectStyles() }, [])

  const [formData, setFormData] = useState({
    name: course?.name || '',
    code: course?.code || '',
    shortDescription: course?.shortDescription || '',
    fullDescription: course?.fullDescription || '',
    thumbnail: course?.thumbnail || '',
    images: course?.images || [],
    duration: { value: course?.duration?.value || 3, unit: course?.duration?.unit || COURSE_DURATION_UNITS.MONTHS },
    totalFees: course?.totalFees || 0,
    installmentAllowed: course?.installmentAllowed ?? true,
    numberOfInstallments: course?.numberOfInstallments || 1,
    level: course?.level || COURSE_LEVELS.BEGINNER,
    skillsToLearn: course?.skillsToLearn || [],
    syllabus: course?.syllabus || [],
    careerOpportunities: course?.careerOpportunities || [],
    certificateProvided: course?.certificateProvided ?? true,
    certificateDetails: course?.certificateDetails || { certificateType: 'Digital', issuingAuthority: '', validity: '', additionalInfo: '' },
    projects: course?.projects || [],
    learningOutcomes: course?.learningOutcomes || [],
    prerequisites: course?.prerequisites || [],
    targetAudience: course?.targetAudience || [],
    language: course?.language || 'English',
    features: course?.features || [],
    benefits: course?.benefits || [],
    whatIncludes: course?.whatIncludes || [],
    faqs: course?.faqs || [],
    seoMetadata: course?.seoMetadata || { metaTitle: '', metaDescription: '', metaKeywords: [], ogImage: '' },
    popularity: course?.popularity || { views: 0, enrollments: 0, featured: false, sortOrder: 0 },
    discount: {
      isDiscounted: course?.discount?.isDiscounted || false,
      discountPercentage: course?.discount?.discountPercentage || 0,
      discountedPrice: course?.discount?.discountedPrice || 0,
      validUntil: course?.discount?.validUntil || ''
    },
    tags: course?.tags || [],
    category: course?.category || '',
    subcategory: course?.subcategory || '',
    eligibilityCriteria: course?.eligibilityCriteria || [],
    isActive: course?.isActive ?? true
  })

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const panelKey = useRef(0)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(f => ({ ...f, [parent]: { ...f[parent], [child]: type === 'checkbox' ? checked : value } }))
    } else {
      setFormData(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    }
  }

  const handleArrayChange = (name, value) => {
    setFormData(f => ({ ...f, [name]: value.split(',').map(i => i.trim()).filter(Boolean) }))
  }

  // Syllabus
  const addSyllabusModule = () => setFormData(f => ({
    ...f, syllabus: [...f.syllabus, { moduleName: '', moduleDescription: '', topics: [], moduleDuration: 0, order: f.syllabus.length }]
  }))
  const removeSyllabusModule = (i) => setFormData(f => ({ ...f, syllabus: f.syllabus.filter((_, idx) => idx !== i) }))
  const handleSyllabusChange = (i, field, val) => {
    const s = [...formData.syllabus]; s[i][field] = val; setFormData(f => ({ ...f, syllabus: s }))
  }
  const addTopic = (mi) => {
    const s = [...formData.syllabus]
    s[mi].topics.push({ topicName: '', topicDescription: '', duration: 0, resources: [] })
    setFormData(f => ({ ...f, syllabus: s }))
  }
  const handleTopicChange = (mi, ti, field, val) => {
    const s = [...formData.syllabus]; s[mi].topics[ti][field] = val; setFormData(f => ({ ...f, syllabus: s }))
  }
  const removeTopic = (mi, ti) => {
    const s = [...formData.syllabus]
    s[mi].topics = s[mi].topics.filter((_, i) => i !== ti)
    setFormData(f => ({ ...f, syllabus: s }))
  }

  // Projects
  const addProject = () => setFormData(f => ({
    ...f, projects: [...f.projects, { projectName: '', projectDescription: '', technologiesUsed: [], difficulty: 'Intermediate', duration: 0, githubLink: '', demoLink: '' }]
  }))
  const removeProject = (i) => setFormData(f => ({ ...f, projects: f.projects.filter((_, idx) => idx !== i) }))
  const handleProjectChange = (i, field, val) => {
    const p = [...formData.projects]; p[i][field] = val; setFormData(f => ({ ...f, projects: p }))
  }

  // FAQs
  const addFaq = () => setFormData(f => ({ ...f, faqs: [...f.faqs, { question: '', answer: '' }] }))
  const removeFaq = (i) => setFormData(f => ({ ...f, faqs: f.faqs.filter((_, idx) => idx !== i) }))
  const handleFaqChange = (i, field, val) => {
    const fqs = [...formData.faqs]; fqs[i][field] = val; setFormData(f => ({ ...f, faqs: fqs }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...formData, totalProjects: formData.projects.length }
      if (course?._id) {
        await fetch(`/api/courses/${course._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } else {
        await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      }
      onSuccess?.()
    } catch (err) {
      alert('Error saving course')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'basic',    label: 'Basic Info',    icon: icons.basic    },
    { id: 'content',  label: 'Content',       icon: icons.content,
      count: formData.syllabus.length + formData.projects.length + formData.faqs.length || null },
    { id: 'pricing',  label: 'Pricing',       icon: icons.pricing  },
    { id: 'media',    label: 'Media & SEO',   icon: icons.media    },
    { id: 'advanced', label: 'Advanced',      icon: icons.advanced },
  ]

  const switchTab = (id) => {
    panelKey.current += 1
    setActiveTab(id)
  }

  const discountedPrice = formData.totalFees - (formData.totalFees * formData.discount.discountPercentage / 100)
  const descLen = formData.shortDescription.length

  return (
    <div className="cf-wrap">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div className="cf-header">
          <div className="cf-header-top">
            <h1 className="cf-title">
              {course?._id ? 'Edit Course' : 'New Course'}
            </h1>
            <span className="cf-badge">{course?._id ? 'Editing' : 'Draft'}</span>
          </div>

          <nav className="cf-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => switchTab(t.id)}
                className={`cf-tab ${activeTab === t.id ? 'active' : ''}`}
              >
                <svg className="cf-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={t.icon} />
                </svg>
                {t.label}
                {t.count ? <span className="cf-tab-count">{t.count}</span> : null}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Body ── */}
        <div className="cf-body" style={{ flex: 1 }}>

          {/* ═══════════════ BASIC INFO ═══════════════ */}
          {activeTab === 'basic' && (
            <div className="cf-panel" key={`basic-${panelKey.current}`}>
              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">Core Details</span>
                </div>
                <div className="cf-grid-2" style={{ marginBottom: 16 }}>
                  <Field label="Course Name" required>
                    <input className="cf-input" type="text" name="name" value={formData.name}
                      onChange={handleChange} placeholder="e.g. Full Stack Web Development" required />
                  </Field>
                  <Field label="Course Code" hint="Auto-generated if left empty">
                    <input className="cf-input" type="text" name="code" value={formData.code}
                      onChange={handleChange} placeholder="e.g. FSWD-101" disabled={!!course?.code} />
                  </Field>
                </div>

                <div className="cf-grid-2">
                  <Field label="Category" required>
                    <input className="cf-input" type="text" name="category" value={formData.category}
                      onChange={handleChange} placeholder="e.g. Technology" required />
                  </Field>
                  <Field label="Subcategory">
                    <input className="cf-input" type="text" name="subcategory" value={formData.subcategory}
                      onChange={handleChange} placeholder="e.g. Web Development" />
                  </Field>
                </div>
              </div>

              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">Description</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Field label="Short Description" required>
                    <textarea className="cf-textarea" name="shortDescription" value={formData.shortDescription}
                      onChange={handleChange} maxLength={200} rows={3}
                      placeholder="A compelling 1–2 sentence overview of this course…" required style={{ minHeight: 76 }} />
                  </Field>
                  <p className={`cf-counter ${descLen > 180 ? 'warn' : ''} ${descLen >= 200 ? 'over' : ''}`}>
                    {descLen} / 200
                  </p>
                </div>
                <Field label="Full Description" required>
                  <textarea className="cf-textarea" name="fullDescription" value={formData.fullDescription}
                    onChange={handleChange} rows={7} required
                    placeholder="Describe the course in detail — what students will learn, why it matters, what makes it unique…" />
                </Field>
              </div>

              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">Settings</span>
                </div>
                <div className="cf-grid-3" style={{ marginBottom: 16 }}>
                  <Field label="Level" required>
                    <select className="cf-select" name="level" value={formData.level} onChange={handleChange} required>
                      {Object.values(COURSE_LEVELS).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </Field>
                  <Field label="Language">
                    <input className="cf-input" type="text" name="language" value={formData.language}
                      onChange={handleChange} placeholder="English" />
                  </Field>
                  <Field label="Duration" required>
                    <div className="cf-duration-wrap">
                      <input className="cf-input" type="number" name="duration.value" value={formData.duration.value}
                        onChange={handleChange} min={1} required />
                      <select className="cf-select" name="duration.unit" value={formData.duration.unit} onChange={handleChange}>
                        {Object.values(COURSE_DURATION_UNITS).map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </Field>
                </div>

                <div className="cf-grid-2">
                  <Field label="Tags" hint="Comma-separated">
                    <input className="cf-input" type="text" value={formData.tags.join(', ')}
                      onChange={e => handleArrayChange('tags', e.target.value)} placeholder="JavaScript, React, Node.js" />
                  </Field>
                  <Field label="Skills to Learn" hint="Comma-separated">
                    <input className="cf-input" type="text" value={formData.skillsToLearn.join(', ')}
                      onChange={e => handleArrayChange('skillsToLearn', e.target.value)} placeholder="HTML, CSS, React, MongoDB" />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ CONTENT ═══════════════ */}
          {activeTab === 'content' && (
            <div className="cf-panel" key={`content-${panelKey.current}`}>

              {/* Syllabus */}
              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">Syllabus Modules</span>
                  <button type="button" className="cf-btn cf-btn-primary cf-btn-sm" onClick={addSyllabusModule}>
                    <Icon d={icons.plus} size={13} /> Add Module
                  </button>
                </div>

                {formData.syllabus.length === 0 && (
                  <div className="cf-infobox" style={{ textAlign: 'center', padding: '24px 16px' }}>
                    <p style={{ color: 'var(--cf-muted)' }}>No modules yet. Click "Add Module" to get started.</p>
                  </div>
                )}

                {formData.syllabus.map((mod, mi) => (
                  <div key={mi} className="cf-module">
                    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                      <input className="cf-input" type="text" placeholder="Module name…"
                        value={mod.moduleName}
                        onChange={e => handleSyllabusChange(mi, 'moduleName', e.target.value)}
                        style={{ flex: 1 }} />
                      <input className="cf-input" type="number" placeholder="Hours"
                        value={mod.moduleDuration} min={0}
                        onChange={e => handleSyllabusChange(mi, 'moduleDuration', +e.target.value)}
                        style={{ width: 90 }} />
                      <button type="button" className="cf-btn cf-btn-danger cf-btn-icon" onClick={() => removeSyllabusModule(mi)}
                        title="Remove module">
                        <Icon d={icons.trash} size={13} />
                      </button>
                    </div>
                    <textarea className="cf-textarea" placeholder="Module description (optional)…"
                      rows={2} value={mod.moduleDescription} style={{ marginBottom: 12, minHeight: 58 }}
                      onChange={e => handleSyllabusChange(mi, 'moduleDescription', e.target.value)} />

                    {mod.topics.map((topic, ti) => (
                      <div key={ti} className="cf-topic">
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <input className="cf-input" type="text" placeholder="Topic name…"
                            value={topic.topicName} style={{ flex: 1 }}
                            onChange={e => handleTopicChange(mi, ti, 'topicName', e.target.value)} />
                          <input className="cf-input" type="number" placeholder="Hrs" min={0}
                            value={topic.duration} style={{ width: 70 }}
                            onChange={e => handleTopicChange(mi, ti, 'duration', +e.target.value)} />
                          <button type="button" className="cf-btn cf-btn-danger cf-btn-icon" onClick={() => removeTopic(mi, ti)}>
                            <Icon d={icons.trash} size={12} />
                          </button>
                        </div>
                        <textarea className="cf-textarea" placeholder="Topic description…"
                          rows={2} value={topic.topicDescription} style={{ minHeight: 52 }}
                          onChange={e => handleTopicChange(mi, ti, 'topicDescription', e.target.value)} />
                      </div>
                    ))}

                    <button type="button" className="cf-btn cf-btn-add" style={{ marginTop: 10 }} onClick={() => addTopic(mi)}>
                      <Icon d={icons.plus} size={13} /> Add Topic
                    </button>
                  </div>
                ))}
              </div>

              {/* Projects */}
              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">Projects</span>
                  <button type="button" className="cf-btn cf-btn-primary cf-btn-sm" onClick={addProject}>
                    <Icon d={icons.plus} size={13} /> Add Project
                  </button>
                </div>

                {formData.projects.map((proj, i) => (
                  <div key={i} className="cf-project-card">
                    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                      <input className="cf-input" type="text" placeholder="Project name…"
                        value={proj.projectName} style={{ flex: 1 }}
                        onChange={e => handleProjectChange(i, 'projectName', e.target.value)} />
                      <button type="button" className="cf-btn cf-btn-danger cf-btn-icon" onClick={() => removeProject(i)}>
                        <Icon d={icons.trash} size={13} />
                      </button>
                    </div>
                    <textarea className="cf-textarea" placeholder="Project description…" rows={2}
                      value={proj.projectDescription} style={{ marginBottom: 10, minHeight: 58 }}
                      onChange={e => handleProjectChange(i, 'projectDescription', e.target.value)} />
                    <div className="cf-grid-3">
                      <input className="cf-input" type="text" placeholder="Technologies (comma-sep)"
                        value={proj.technologiesUsed.join(', ')}
                        onChange={e => handleProjectChange(i, 'technologiesUsed', e.target.value.split(',').map(t => t.trim()))} />
                      <select className="cf-select" value={proj.difficulty}
                        onChange={e => handleProjectChange(i, 'difficulty', e.target.value)}>
                        {Object.values(PROJECT_DIFFICULTY).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <input className="cf-input" type="number" placeholder="Duration (hrs)" min={0}
                        value={proj.duration}
                        onChange={e => handleProjectChange(i, 'duration', +e.target.value)} />
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <input className="cf-input" type="url" placeholder="GitHub URL (optional)"
                        value={proj.githubLink}
                        onChange={e => handleProjectChange(i, 'githubLink', e.target.value)} />
                    </div>
                  </div>
                ))}

                {formData.projects.length === 0 && (
                  <div className="cf-infobox" style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ color: 'var(--cf-muted)' }}>No projects added yet.</p>
                  </div>
                )}
              </div>

              {/* Learning Outcomes & Prerequisites */}
              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">Outcomes & Requirements</span>
                </div>
                <div className="cf-grid-2" style={{ marginBottom: 16 }}>
                  <Field label="Learning Outcomes" hint="One per line">
                    <textarea className="cf-textarea" rows={5}
                      value={formData.learningOutcomes.join('\n')}
                      onChange={e => setFormData(f => ({ ...f, learningOutcomes: e.target.value.split('\n').filter(l => l.trim()) }))}
                      placeholder={"Build full-stack applications\nUnderstand MERN architecture"} />
                  </Field>
                  <Field label="Prerequisites" hint="One per line">
                    <textarea className="cf-textarea" rows={5}
                      value={formData.prerequisites.join('\n')}
                      onChange={e => setFormData(f => ({ ...f, prerequisites: e.target.value.split('\n').filter(l => l.trim()) }))}
                      placeholder={"Basic HTML/CSS\nJavaScript fundamentals"} />
                  </Field>
                </div>
                <Field label="Career Opportunities" hint="One per line">
                  <textarea className="cf-textarea" rows={3}
                    value={formData.careerOpportunities.join('\n')}
                    onChange={e => setFormData(f => ({ ...f, careerOpportunities: e.target.value.split('\n').filter(l => l.trim()) }))}
                    placeholder={"Frontend Developer\nFull Stack Developer"} />
                </Field>
              </div>

              {/* FAQ */}
              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">FAQ</span>
                  <button type="button" className="cf-btn cf-btn-primary cf-btn-sm" onClick={addFaq}>
                    <Icon d={icons.plus} size={13} /> Add FAQ
                  </button>
                </div>

                {formData.faqs.map((faq, i) => (
                  <div key={i} className="cf-faq-card">
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input className="cf-input" type="text" placeholder="Question…"
                        value={faq.question} style={{ flex: 1 }}
                        onChange={e => handleFaqChange(i, 'question', e.target.value)} />
                      <button type="button" className="cf-btn cf-btn-danger cf-btn-icon" onClick={() => removeFaq(i)}>
                        <Icon d={icons.trash} size={12} />
                      </button>
                    </div>
                    <textarea className="cf-textarea" placeholder="Answer…" rows={2}
                      value={faq.answer} style={{ minHeight: 58 }}
                      onChange={e => handleFaqChange(i, 'answer', e.target.value)} />
                  </div>
                ))}

                {formData.faqs.length === 0 && (
                  <p style={{ color: 'var(--cf-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No FAQs added yet.</p>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ PRICING ═══════════════ */}
          {activeTab === 'pricing' && (
            <div className="cf-panel" key={`pricing-${panelKey.current}`}>

              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">Fees</span>
                </div>
                <div className="cf-grid-2">
                  <Field label="Total Fees (₹)" required>
                    <input className="cf-input" type="number" name="totalFees"
                      value={formData.totalFees} onChange={handleChange} min={0} required
                      placeholder="0" />
                  </Field>
                  <Field label="Installments">
                    <CheckRow label="Allow installments" name="installmentAllowed"
                      checked={formData.installmentAllowed} onChange={handleChange}>
                      <input className="cf-input" type="number" name="numberOfInstallments"
                        value={formData.numberOfInstallments} onChange={handleChange} min={1}
                        placeholder="Number of installments" />
                    </CheckRow>
                  </Field>
                </div>
              </div>

              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">Discount</span>
                </div>
                <CheckRow label="Apply a discount" checked={formData.discount.isDiscounted}
                  onChange={e => setFormData(f => ({ ...f, discount: { ...f.discount, isDiscounted: e.target.checked } }))}>
                  <div className="cf-grid-2" style={{ marginTop: 4 }}>
                    <Field label="Discount (%)">
                      <input className="cf-input" type="number" name="discount.discountPercentage"
                        value={formData.discount.discountPercentage} onChange={handleChange}
                        min={0} max={100} placeholder="e.g. 20" />
                    </Field>
                    <Field label="Valid Until">
                      <input className="cf-input" type="datetime-local" name="discount.validUntil"
                        value={formData.discount.validUntil} onChange={handleChange} />
                    </Field>
                  </div>
                  {formData.discount.discountPercentage > 0 && (
                    <div className="cf-infobox" style={{ marginTop: 12 }}>
                      <p>
                        Discounted Price: ₹{discountedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        <span style={{ opacity: 0.6, marginLeft: 8, fontSize: 12 }}>
                          ({formData.discount.discountPercentage}% off ₹{Number(formData.totalFees).toLocaleString('en-IN')})
                        </span>
                      </p>
                    </div>
                  )}
                </CheckRow>
              </div>

              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">Certificate</span>
                </div>
                <CheckRow label="Provide a certificate" name="certificateProvided"
                  checked={formData.certificateProvided} onChange={handleChange}>
                  <div className="cf-grid-2" style={{ marginTop: 4 }}>
                    <Field label="Certificate Type">
                      <select className="cf-select" name="certificateDetails.certificateType"
                        value={formData.certificateDetails.certificateType} onChange={handleChange}>
                        {Object.values(CERTIFICATE_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Issuing Authority">
                      <input className="cf-input" type="text" name="certificateDetails.issuingAuthority"
                        value={formData.certificateDetails.issuingAuthority} onChange={handleChange}
                        placeholder="e.g. Coursify Institute" />
                    </Field>
                    <Field label="Validity">
                      <input className="cf-input" type="text" name="certificateDetails.validity"
                        value={formData.certificateDetails.validity} onChange={handleChange}
                        placeholder="e.g. Lifetime" />
                    </Field>
                  </div>
                </CheckRow>
              </div>
            </div>
          )}

          {/* ═══════════════ MEDIA & SEO ═══════════════ */}
          {activeTab === 'media' && (
            <div className="cf-panel" key={`media-${panelKey.current}`}>

              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">Thumbnail</span>
                </div>
                <Field label="Thumbnail URL" required>
                  <input className="cf-input" type="url" name="thumbnail"
                    value={formData.thumbnail} onChange={handleChange} required
                    placeholder="https://example.com/course-thumb.jpg" />
                </Field>
                {formData.thumbnail && (
                  <div className="cf-thumb-preview">
                    <img src={formData.thumbnail} alt="Thumbnail preview"
                      onError={e => { e.target.style.display = 'none' }} />
                  </div>
                )}
              </div>

              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">SEO Metadata</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Meta Title">
                    <input className="cf-input" type="text" name="seoMetadata.metaTitle"
                      value={formData.seoMetadata.metaTitle} onChange={handleChange}
                      placeholder="e.g. Full Stack Web Development Course | Learn MERN" />
                  </Field>
                  <Field label="Meta Description">
                    <textarea className="cf-textarea" rows={3} name="seoMetadata.metaDescription"
                      value={formData.seoMetadata.metaDescription} onChange={handleChange}
                      placeholder="A concise description for search engines (under 160 chars)…" />
                  </Field>
                  <Field label="Meta Keywords" hint="Comma-separated">
                    <input className="cf-input" type="text"
                      value={formData.seoMetadata.metaKeywords.join(', ')}
                      onChange={e => setFormData(f => ({
                        ...f, seoMetadata: { ...f.seoMetadata, metaKeywords: e.target.value.split(',').map(k => k.trim()) }
                      }))}
                      placeholder="web development, react, node.js, full stack" />
                  </Field>
                  <Field label="OG Image URL">
                    <input className="cf-input" type="url" name="seoMetadata.ogImage"
                      value={formData.seoMetadata.ogImage} onChange={handleChange}
                      placeholder="https://example.com/og-image.jpg" />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ ADVANCED ═══════════════ */}
          {activeTab === 'advanced' && (
            <div className="cf-panel" key={`advanced-${panelKey.current}`}>

              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">Visibility & Feature</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <label className="cf-toggle-wrap">
                    <input type="checkbox" className="cf-checkbox" name="isActive"
                      checked={formData.isActive} onChange={handleChange} />
                    <span className="cf-checkbox-label">Course Active — visible to students</span>
                  </label>

                  <CheckRow label="Feature this course" checked={formData.popularity.featured}
                    onChange={e => setFormData(f => ({ ...f, popularity: { ...f.popularity, featured: e.target.checked } }))}>
                    <Field label="Featured Sort Order" hint="Lower = appears first">
                      <input className="cf-input" type="number" name="popularity.sortOrder"
                        value={formData.popularity.sortOrder} onChange={handleChange} min={0} style={{ maxWidth: 200 }} />
                    </Field>
                  </CheckRow>
                </div>
              </div>

              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">Eligibility & Inclusions</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Eligibility Criteria" hint="One per line">
                    <textarea className="cf-textarea" rows={3}
                      value={formData.eligibilityCriteria.join('\n')}
                      onChange={e => setFormData(f => ({ ...f, eligibilityCriteria: e.target.value.split('\n').filter(l => l.trim()) }))}
                      placeholder={"Minimum 50% in 12th grade\nBasic computer knowledge"} />
                  </Field>
                  <Field label="What's Included" hint="One per line">
                    <textarea className="cf-textarea" rows={3}
                      value={formData.whatIncludes.join('\n')}
                      onChange={e => setFormData(f => ({ ...f, whatIncludes: e.target.value.split('\n').filter(l => l.trim()) }))}
                      placeholder={"Video lectures\nDownloadable resources\nCertificate"} />
                  </Field>
                  <Field label="Features" hint="One per line">
                    <textarea className="cf-textarea" rows={3}
                      value={formData.features.join('\n')}
                      onChange={e => setFormData(f => ({ ...f, features: e.target.value.split('\n').filter(l => l.trim()) }))}
                      placeholder={"Live projects\nIndustry expert instructors\nCareer guidance"} />
                  </Field>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="cf-footer">
          <div className="cf-footer-left">
            <span style={{ fontSize: 12, color: 'var(--cf-muted)' }}>
              {course?._id ? `Editing: ${course.name || 'Course'}` : 'Creating new course'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="cf-btn cf-btn-ghost" onClick={() => onSuccess?.()}>
              Cancel
            </button>
            <button type="submit" className="cf-btn cf-btn-primary" disabled={loading}>
              {loading ? (
                <><div className="cf-spinner" /> Saving…</>
              ) : (
                <><Icon d={icons.check} size={14} /> {course?._id ? 'Update Course' : 'Create Course'}</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CourseForm