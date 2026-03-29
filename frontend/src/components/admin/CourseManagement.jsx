// CourseManagement.jsx — Improved UI/UX
import React, { useState, useEffect, useRef } from 'react'
import CourseForm from './CourseForm'

// ─── Inject scoped styles ─────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById('cm-styles')) return
  const s = document.createElement('style')
  s.id = 'cm-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Figtree:wght@300;400;500;600;700&display=swap');

    /* ── Reset inside scope ── */
    .cm-root *, .cm-overlay * { box-sizing: border-box; }

    /* ── Root ── */
    .cm-root {
      font-family: 'Figtree', sans-serif;
      background: #f1f5f9;
      min-height: 100vh;
      color: #0f172a;
    }

    /* ════════════════════════════════
       OVERLAY / DRAWER
    ════════════════════════════════ */

    /* Full-viewport overlay — covers sidebar too */
    .cm-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: stretch;
      justify-content: flex-end;
      font-family: 'Figtree', sans-serif;
    }

    .cm-overlay-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(15,23,42,0.55);
      backdrop-filter: blur(4px);
      animation: cmFadeIn 0.25s ease both;
    }

    @keyframes cmFadeIn  { from { opacity: 0 } to { opacity: 1 } }
    @keyframes cmSlideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
    @keyframes cmScaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
    @keyframes cmUp      { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }

    /* ── Drawer (Add / Edit form) ── */
    .cm-drawer {
      position: relative;
      z-index: 1;
      width: min(780px, 100vw);
      height: 100vh;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      box-shadow: -8px 0 40px rgba(0,0,0,0.18);
      animation: cmSlideIn 0.32s cubic-bezier(0.22,1,0.36,1) both;
      overflow: hidden;
    }

    .cm-drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 28px;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
      background: #fff;
    }

    .cm-drawer-title {
      font-family: 'Syne', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.2px;
    }

    .cm-drawer-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    /* ── View modal (centred dialog) ── */
    .cm-dialog-wrap {
      position: relative;
      z-index: 1;
      width: min(680px, 96vw);
      max-height: 88vh;
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 32px 80px rgba(0,0,0,0.22);
      animation: cmScaleIn 0.26s cubic-bezier(0.22,1,0.36,1) both;
      margin: auto;
    }

    .cm-dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
    }

    .cm-dialog-title {
      font-family: 'Syne', sans-serif;
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
    }

    .cm-dialog-body {
      overflow-y: auto;
      padding: 24px;
      flex: 1;
    }

    /* ── Confirm dialog ── */
    .cm-confirm-wrap {
      position: relative;
      z-index: 1;
      width: min(420px, 94vw);
      background: #fff;
      border-radius: 20px;
      padding: 32px 28px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.2);
      animation: cmScaleIn 0.22s cubic-bezier(0.22,1,0.36,1) both;
      margin: auto;
      font-family: 'Figtree', sans-serif;
    }

    /* ── Close btn ── */
    .cm-close {
      width: 34px; height: 34px;
      border-radius: 9px;
      border: 1.5px solid #e2e8f0;
      background: #f8fafc;
      color: #64748b;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
      flex-shrink: 0;
    }
    .cm-close:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }

    /* ════════════════════════════════
       PAGE CONTENT
    ════════════════════════════════ */

    .cm-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 28px 28px 60px;
    }

    /* ── Page header ── */
    .cm-page-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 28px;
      flex-wrap: wrap;
      animation: cmUp 0.3s ease both;
    }

    .cm-page-title {
      font-family: 'Syne', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      line-height: 1.15;
    }

    .cm-page-sub {
      font-size: 13px;
      color: #64748b;
      margin-top: 3px;
      font-weight: 400;
    }

    /* ── Stats row ── */
    .cm-stats {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
      margin-bottom: 24px;
      animation: cmUp 0.35s 0.05s ease both;
    }

    @media (max-width: 1100px) { .cm-stats { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 640px)  { .cm-stats { grid-template-columns: repeat(2, 1fr); } }

    .cm-stat {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .cm-stat:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }

    .cm-stat-val {
      font-family: 'Syne', sans-serif;
      font-size: 24px;
      font-weight: 700;
      line-height: 1;
      margin-top: 4px;
    }
    .cm-stat-label { font-size: 11.5px; color: #94a3b8; font-weight: 500; letter-spacing: 0.3px; }

    .cm-stat-icon {
      width: 40px; height: 40px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px;
      flex-shrink: 0;
    }

    /* ── Toolbar ── */
    .cm-toolbar {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 14px 16px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      animation: cmUp 0.38s 0.08s ease both;
    }

    .cm-toolbar-row {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }

    .cm-search-wrap {
      flex: 1;
      min-width: 200px;
      position: relative;
    }

    .cm-search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 14px;
      pointer-events: none;
    }

    .cm-search-input {
      width: 100%;
      padding: 9px 36px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-family: 'Figtree', sans-serif;
      font-size: 14px;
      color: #0f172a;
      outline: none;
      background: #f8fafc;
      transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
    }
    .cm-search-input::placeholder { color: #94a3b8; }
    .cm-search-input:focus {
      border-color: #93c5fd;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(147,197,253,0.2);
    }

    .cm-search-clear {
      position: absolute;
      right: 10px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      color: #94a3b8; cursor: pointer;
      padding: 2px; font-size: 13px;
      transition: color 0.15s;
    }
    .cm-search-clear:hover { color: #ef4444; }

    /* toolbar buttons */
    .cm-tbtn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      background: #f8fafc;
      color: #475569;
      font-family: 'Figtree', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.16s;
      white-space: nowrap;
    }
    .cm-tbtn:hover { background: #f1f5f9; border-color: #cbd5e1; color: #0f172a; }
    .cm-tbtn.active { background: #eff6ff; border-color: #93c5fd; color: #2563eb; }

    /* ── Filters row ── */
    .cm-filters {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
      animation: cmUp 0.2s ease both;
    }

    @media (max-width: 900px) { .cm-filters { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 500px) { .cm-filters { grid-template-columns: 1fr; } }

    .cm-filter-label { font-size: 11px; font-weight: 600; color: #94a3b8; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 5px; }

    .cm-filter-input, .cm-filter-select {
      width: 100%;
      padding: 8px 12px;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-family: 'Figtree', sans-serif;
      font-size: 13px;
      color: #334155;
      background: #f8fafc;
      outline: none;
      appearance: none;
      -webkit-appearance: none;
      transition: border-color 0.16s;
    }
    .cm-filter-input:focus, .cm-filter-select:focus { border-color: #93c5fd; background: #fff; }
    .cm-filter-select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 32px;
      cursor: pointer;
    }

    .cm-filter-clear {
      background: none; border: none;
      font-family: 'Figtree', sans-serif;
      font-size: 13px;
      color: #3b82f6;
      cursor: pointer;
      padding: 0;
      font-weight: 500;
      transition: color 0.15s;
    }
    .cm-filter-clear:hover { color: #1d4ed8; }

    /* ════════════════════════════════
       GRID + CARDS
    ════════════════════════════════ */

    .cm-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
      animation: cmUp 0.4s 0.1s ease both;
    }

    @media (max-width: 1200px) { .cm-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 860px)  { .cm-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 520px)  { .cm-grid { grid-template-columns: 1fr; } }

    .cm-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      overflow: hidden;
      transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
      cursor: default;
      display: flex;
      flex-direction: column;
    }
    .cm-card:hover {
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
      transform: translateY(-3px);
      border-color: #cbd5e1;
    }

    .cm-card-img {
      position: relative;
      height: 148px;
      overflow: hidden;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      flex-shrink: 0;
    }

    .cm-card-img img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }
    .cm-card:hover .cm-card-img img { transform: scale(1.06); }

    .cm-card-img-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      font-size: 40px; opacity: 0.3;
    }

    .cm-card-img-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(15,23,42,0.5) 0%, transparent 55%);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .cm-card:hover .cm-card-img-overlay { opacity: 1; }

    .cm-chip {
      position: absolute;
      padding: 3px 9px;
      border-radius: 20px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .cm-chip-discount {
      top: 10px; right: 10px;
      background: #ef4444; color: #fff;
      box-shadow: 0 2px 8px rgba(239,68,68,0.4);
    }
    .cm-chip-featured {
      top: 10px; left: 10px;
      background: #f59e0b; color: #fff;
      box-shadow: 0 2px 8px rgba(245,158,11,0.4);
      display: flex; align-items: center; gap: 4px;
    }

    /* toggle pill on card */
    .cm-status-toggle {
      position: absolute;
      bottom: 10px; right: 10px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      display: flex; align-items: center; gap: 4px;
      transition: all 0.15s;
    }
    .cm-status-toggle.active-st { background: rgba(16,185,129,0.9); color: #fff; }
    .cm-status-toggle.inactive-st { background: rgba(100,116,139,0.85); color: #fff; }
    .cm-status-toggle:hover { transform: scale(1.05); }

    /* card body */
    .cm-card-body {
      padding: 14px 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .cm-card-title {
      font-family: 'Syne', sans-serif;
      font-size: 14.5px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      transition: color 0.15s;
    }
    .cm-card:hover .cm-card-title { color: #2563eb; }

    .cm-card-code { font-size: 11px; color: #94a3b8; margin-bottom: 8px; }

    .cm-card-desc {
      font-size: 12.5px;
      color: #64748b;
      line-height: 1.5;
      margin-bottom: 10px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      flex: 1;
    }

    /* level badge */
    .cm-level { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 8px; font-size: 11px; font-weight: 600; margin-bottom: 10px; border: 1px solid; }
    .cm-level-beginner     { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }
    .cm-level-intermediate { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
    .cm-level-advanced     { background: #fef3c7; color: #92400e; border-color: #fde68a; }
    .cm-level-all          { background: #f3e8ff; color: #6b21a8; border-color: #e9d5ff; }
    .cm-level-default      { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }

    /* meta row */
    .cm-card-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 10px;
    }
    .cm-meta-item { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: #64748b; }
    .cm-meta-icon { font-size: 11px; color: #94a3b8; }

    /* price */
    .cm-price { margin-bottom: 12px; }
    .cm-price-orig { font-size: 11px; color: #94a3b8; text-decoration: line-through; }
    .cm-price-main { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; }
    .cm-price-discount { color: #ef4444; }
    .cm-price-regular  { color: #2563eb; }
    .cm-price-save { font-size: 11px; color: #16a34a; font-weight: 500; margin-left: 6px; }

    /* card actions */
    .cm-card-actions {
      display: flex;
      border-top: 1px solid #f1f5f9;
      padding-top: 10px;
      gap: 4px;
    }
    .cm-action-btn {
      flex: 1;
      padding: 7px 4px;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-family: 'Figtree', sans-serif;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 4px;
      transition: all 0.15s;
    }
    .cm-action-btn.view   { color: #2563eb; } .cm-action-btn.view:hover   { background: #eff6ff; }
    .cm-action-btn.edit   { color: #059669; } .cm-action-btn.edit:hover   { background: #ecfdf5; }
    .cm-action-btn.delete { color: #dc2626; } .cm-action-btn.delete:hover { background: #fef2f2; }

    /* ════════════════════════════════
       LIST VIEW
    ════════════════════════════════ */

    .cm-table-wrap {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      overflow: hidden;
      animation: cmUp 0.4s 0.1s ease both;
    }

    .cm-table {
      width: 100%;
      border-collapse: collapse;
    }

    .cm-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: #94a3b8;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .cm-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13.5px;
      color: #334155;
      vertical-align: middle;
    }

    .cm-table tr:last-child td { border-bottom: none; }

    .cm-table tr:hover td { background: #fafafa; }

    .cm-table-avatar {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #bfdbfe 0%, #dbeafe 100%);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
      overflow: hidden;
    }
    .cm-table-avatar img { width: 100%; height: 100%; object-fit: cover; }

    /* ════════════════════════════════
       EMPTY STATE
    ════════════════════════════════ */

    .cm-empty {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 64px 24px;
      text-align: center;
      animation: cmUp 0.3s ease both;
    }

    .cm-empty-icon {
      width: 72px; height: 72px;
      background: #f1f5f9;
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      font-size: 32px;
      margin: 0 auto 18px;
    }

    .cm-empty-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
    .cm-empty-sub   { font-size: 14px; color: #64748b; margin-bottom: 24px; }

    /* ════════════════════════════════
       PAGINATION
    ════════════════════════════════ */

    .cm-pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
      margin-top: 32px;
    }

    .cm-pg-btn {
      width: 36px; height: 36px;
      border-radius: 10px;
      border: 1.5px solid #e2e8f0;
      background: #fff;
      color: #475569;
      font-family: 'Figtree', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .cm-pg-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
    .cm-pg-btn.current { background: #2563eb; border-color: #2563eb; color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,0.3); }
    .cm-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ════════════════════════════════
       BUTTONS (CTA)
    ════════════════════════════════ */

    .cm-btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 10px 20px;
      border-radius: 11px;
      font-family: 'Figtree', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.17s;
      white-space: nowrap;
    }
    .cm-btn:active { transform: scale(0.97); }

    .cm-btn-primary {
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: #fff;
      box-shadow: 0 2px 14px rgba(37,99,235,0.3);
    }
    .cm-btn-primary:hover {
      background: linear-gradient(135deg, #1d4ed8, #2563eb);
      box-shadow: 0 4px 20px rgba(37,99,235,0.38);
      transform: translateY(-1px);
    }

    .cm-btn-danger {
      background: linear-gradient(135deg, #dc2626, #ef4444);
      color: #fff;
      box-shadow: 0 2px 12px rgba(220,38,38,0.25);
    }
    .cm-btn-danger:hover { background: linear-gradient(135deg, #b91c1c, #dc2626); }

    .cm-btn-ghost {
      background: transparent;
      color: #64748b;
      border: 1.5px solid #e2e8f0;
    }
    .cm-btn-ghost:hover { background: #f8fafc; color: #334155; }

    .cm-btn-sm { padding: 7px 14px; font-size: 13px; border-radius: 9px; }

    /* ── Alert ── */
    .cm-alert {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 16px;
      border-radius: 12px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      margin-bottom: 20px;
      font-size: 13.5px;
      color: #b91c1c;
      animation: cmUp 0.2s ease both;
    }

    .cm-alert-close { background: none; border: none; cursor: pointer; color: #b91c1c; margin-left: auto; font-size: 15px; opacity: 0.7; }
    .cm-alert-close:hover { opacity: 1; }

    /* ── Loader ── */
    .cm-loader-wrap {
      display: flex; align-items: center; justify-content: center;
      min-height: 40vh;
    }
    .cm-loader {
      width: 36px; height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: cmSpin 0.7s linear infinite;
    }
    @keyframes cmSpin { to { transform: rotate(360deg); } }

    /* ── View detail rows ── */
    .cm-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 500px) { .cm-detail-grid { grid-template-columns: 1fr; } }

    .cm-detail-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
    }
    .cm-detail-label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; }
    .cm-detail-val   { font-size: 15px; font-weight: 600; color: #0f172a; }

    .cm-tag {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      background: #f1f5f9;
      color: #475569;
      font-size: 11.5px;
      font-weight: 500;
      margin: 2px;
      border: 1px solid #e2e8f0;
    }

    /* ── spinner in btn ── */
    .cm-btn-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: #fff;
      border-radius: 50%;
      animation: cmSpin 0.65s linear infinite;
    }

    /* responsive toolbar */
    @media (max-width: 640px) {
      .cm-inner { padding: 16px 14px 48px; }
      .cm-page-title { font-size: 20px; }
      .cm-page-header { margin-bottom: 18px; }
    }
  `
  document.head.appendChild(s)
}

// ─── Tiny icon helpers ────────────────────────────────────────────────────────
const Ico = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
)

const ICO = {
  plus:       'M12 5v14M5 12h14',
  x:          'M18 6L6 18M6 6l12 12',
  eye:        ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8','M12 9a3 3 0 100 6 3 3 0 000-6z'],
  edit:       ['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7','M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z'],
  trash:      ['M3 6h18','M8 6V4h8v2','M19 6l-1 14H6L5 6'],
  search:     ['M21 21l-4.35-4.35','M17 11A6 6 0 105 11a6 6 0 0012 0'],
  filter:     'M22 3H2l8 9.46V19l4 2v-8.54L22 3',
  refresh:    'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
  grid:       ['M3 3h7v7H3z','M14 3h7v7h-7z','M14 14h7v7h-7z','M3 14h7v7H3z'],
  list:       'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  clock:      ['M12 2a10 10 0 100 20A10 10 0 0012 2z','M12 6v6l4 2'],
  users:      ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M23 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75','M9 11a4 4 0 100-8 4 4 0 000 8z'],
  star:       'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  tag:        ['M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z','M7 7h.01'],
  layers:     ['M12 2L2 7l10 5 10-5-10-5z','M2 17l10 5 10-5','M2 12l10 5 10-5'],
  toggle:     'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
  rupee:      ['M6 3h12','M6 8h12','M6 13l8.5 8','M6 13h3a6 6 0 000-5'],
  cert:       ['M22 11.08V12a10 10 0 11-5.93-9.14','M22 4L12 14.01l-3-3'],
  grad:       ['M22 10v6M2 10l10-5 10 5-10 5z','M6 12v5c3 3 9 3 12 0v-5'],
  chev_l:     'M15 18l-6-6 6-6',
  chev_r:     'M9 18l6-6-6-6',
  warn:       ['M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z','M12 9v4','M12 17h.01'],
}

// ─── Level badge helper ───────────────────────────────────────────────────────
const LevelBadge = ({ level }) => {
  const cls = {
    Beginner: 'cm-level cm-level-beginner',
    Intermediate: 'cm-level cm-level-intermediate',
    Advanced: 'cm-level cm-level-advanced',
    'All Levels': 'cm-level cm-level-all',
  }[level] || 'cm-level cm-level-default'
  return <span className={cls}><Ico d={ICO.tag} size={10} />{level}</span>
}

// ─── Overlay shells ───────────────────────────────────────────────────────────
const Drawer = ({ open, onClose, title, children }) => {
  if (!open) return null
  return (
    <div className="cm-overlay">
      <div className="cm-overlay-backdrop" onClick={onClose} />
      <div className="cm-drawer">
        <div className="cm-drawer-header">
          <span className="cm-drawer-title">{title}</span>
          <button className="cm-close" onClick={onClose} aria-label="Close">
            <Ico d={ICO.x} size={15} />
          </button>
        </div>
        <div className="cm-drawer-body">{children}</div>
      </div>
    </div>
  )
}

const Dialog = ({ open, onClose, title, children }) => {
  if (!open) return null
  return (
    <div className="cm-overlay" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="cm-overlay-backdrop" onClick={onClose} />
      <div className="cm-dialog-wrap">
        <div className="cm-dialog-header">
          <span className="cm-dialog-title">{title}</span>
          <button className="cm-close" onClick={onClose}><Ico d={ICO.x} size={15} /></button>
        </div>
        <div className="cm-dialog-body">{children}</div>
      </div>
    </div>
  )
}

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading }) => {
  if (!open) return null
  return (
    <div className="cm-overlay" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="cm-overlay-backdrop" onClick={onClose} />
      <div className="cm-confirm-wrap">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
            <Ico d={ICO.warn} size={20} />
          </div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        </div>
        <p style={{ fontSize: 14, color: '#475569', marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="cm-btn cm-btn-ghost cm-btn-sm" onClick={onClose}>Cancel</button>
          <button className="cm-btn cm-btn-danger cm-btn-sm" onClick={onConfirm} disabled={loading}>
            {loading ? <div className="cm-btn-spinner" /> : <Ico d={ICO.trash} size={13} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const CourseManagement = () => {
  useEffect(() => { injectStyles() }, [])

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [drawer, setDrawer] = useState({ open: false, mode: 'add' }) // mode: add | edit
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ search: '', category: '', level: '', isActive: '', sortBy: 'newest' })
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 })

  // ── Mock data for demo ──────────────────────────────────────────────────────
  // Replace this block with your real fetchCourses() API call
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setCourses([
        { _id: '1', name: 'Full Stack Web Development', code: 'FSWD-101', shortDescription: 'Master the MERN stack from scratch to deployment.', level: 'Intermediate', duration: { value: 6, unit: 'Months' }, totalFees: 29999, isActive: true, certificateProvided: true, popularity: { featured: true, enrollments: 284 }, discount: { isDiscounted: true, discountPercentage: 20, discountedPrice: 23999 }, rating: { average: 4.8, count: 132 }, thumbnail: '' },
        { _id: '2', name: 'UI/UX Design Bootcamp', code: 'UIUX-201', shortDescription: 'Design beautiful user interfaces with Figma & modern principles.', level: 'Beginner', duration: { value: 3, unit: 'Months' }, totalFees: 19999, isActive: true, certificateProvided: true, popularity: { featured: false, enrollments: 98 }, discount: { isDiscounted: false }, rating: { average: 4.6, count: 67 }, thumbnail: '' },
        { _id: '3', name: 'Data Science with Python', code: 'DS-301', shortDescription: 'Learn data analysis, ML and AI using Python & TensorFlow.', level: 'Advanced', duration: { value: 8, unit: 'Months' }, totalFees: 39999, isActive: false, certificateProvided: true, popularity: { featured: false, enrollments: 45 }, discount: { isDiscounted: true, discountPercentage: 15, discountedPrice: 33999 }, rating: { average: 4.9, count: 23 }, thumbnail: '' },
        { _id: '4', name: 'Digital Marketing Mastery', code: 'DM-101', shortDescription: 'Grow brands online using SEO, social media & paid ads.', level: 'Beginner', duration: { value: 2, unit: 'Months' }, totalFees: 14999, isActive: true, certificateProvided: false, popularity: { featured: false, enrollments: 312 }, discount: { isDiscounted: false }, rating: { average: 4.4, count: 189 }, thumbnail: '' },
        { _id: '5', name: 'Cloud Computing & DevOps', code: 'CC-401', shortDescription: 'AWS, Docker, Kubernetes and CI/CD pipelines.', level: 'Advanced', duration: { value: 5, unit: 'Months' }, totalFees: 34999, isActive: true, certificateProvided: true, popularity: { featured: true, enrollments: 61 }, discount: { isDiscounted: false }, rating: { average: 4.7, count: 38 }, thumbnail: '' },
        { _id: '6', name: 'React Native Mobile Dev', code: 'RN-201', shortDescription: 'Build cross-platform mobile apps with React Native & Expo.', level: 'Intermediate', duration: { value: 4, unit: 'Months' }, totalFees: 24999, isActive: true, certificateProvided: true, popularity: { featured: false, enrollments: 77 }, discount: { isDiscounted: true, discountPercentage: 10, discountedPrice: 22499 }, rating: { average: 4.5, count: 54 }, thumbnail: '' },
      ])
      setPagination({ page: 1, limit: 12, total: 6, pages: 1 })
      setLoading(false)
    }, 800)
  }, [])

  const fetchCourses = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  const handleToggleStatus = (course) => {
    setCourses(prev => prev.map(c => c._id === course._id ? { ...c, isActive: !c.isActive } : c))
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setCourses(prev => prev.filter(c => c._id !== selected._id))
    setDeleteLoading(false)
    setConfirmOpen(false)
    setSelected(null)
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
    setPagination(p => ({ ...p, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({ search: '', category: '', level: '', isActive: '', sortBy: 'newest' })
  }

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => v && !(k === 'sortBy' && v === 'newest'))

  const getCurrentPrice = (c) => c.discount?.isDiscounted && c.discount?.discountedPrice > 0 ? c.discount.discountedPrice : c.totalFees

  const stats = {
    total: pagination.total,
    active: courses.filter(c => c.isActive).length,
    featured: courses.filter(c => c.popularity?.featured).length,
    discounted: courses.filter(c => c.discount?.isDiscounted).length,
    enrollments: courses.reduce((s, c) => s + (c.popularity?.enrollments || 0), 0),
  }

  const statItems = [
    { label: 'Total Courses',     val: stats.total,       color: '#2563eb', bg: '#eff6ff', icon: ICO.layers },
    { label: 'Active',            val: stats.active,      color: '#059669', bg: '#ecfdf5', icon: ICO.toggle },
    { label: 'Featured',          val: stats.featured,    color: '#d97706', bg: '#fffbeb', icon: ICO.star   },
    { label: 'Discounted',        val: stats.discounted,  color: '#dc2626', bg: '#fef2f2', icon: ICO.tag    },
    { label: 'Total Enrollments', val: stats.enrollments, color: '#7c3aed', bg: '#f5f3ff', icon: ICO.users  },
  ]

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="cm-root">
      <div className="cm-inner">

        {/* Page Header */}
        <div className="cm-page-header">
          <div>
            <h1 className="cm-page-title">Course Management</h1>
            <p className="cm-page-sub">Manage, organise and optimise your course catalogue</p>
          </div>
          <button className="cm-btn cm-btn-primary" onClick={() => setDrawer({ open: true, mode: 'add' })}>
            <Ico d={ICO.plus} size={15} /> Add New Course
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="cm-alert">
            <Ico d={ICO.warn} size={16} />
            <span style={{ flex: 1 }}>{error}</span>
            <button className="cm-alert-close" onClick={() => setError('')}><Ico d={ICO.x} size={14} /></button>
          </div>
        )}

        {/* Stats */}
        <div className="cm-stats">
          {statItems.map(st => (
            <div className="cm-stat" key={st.label}>
              <div>
                <div className="cm-stat-label">{st.label}</div>
                <div className="cm-stat-val" style={{ color: st.color }}>{st.val}</div>
              </div>
              <div className="cm-stat-icon" style={{ background: st.bg, color: st.color }}>
                <Ico d={st.icon} size={18} />
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="cm-toolbar">
          <div className="cm-toolbar-row">
            {/* Search */}
            <div className="cm-search-wrap">
              <span className="cm-search-icon"><Ico d={ICO.search} size={13} /></span>
              <input className="cm-search-input" type="text" name="search"
                value={filters.search} onChange={handleFilterChange}
                placeholder="Search by name, code or category…" />
              {filters.search && (
                <button className="cm-search-clear" onClick={() => setFilters(f => ({ ...f, search: '' }))}>
                  <Ico d={ICO.x} size={12} />
                </button>
              )}
            </div>

            {/* Toolbar actions */}
            <button className={`cm-tbtn ${showFilters || hasActiveFilters ? 'active' : ''}`} onClick={() => setShowFilters(v => !v)}>
              <Ico d={ICO.filter} size={13} /> Filters
              {hasActiveFilters && <span style={{ width: 7, height: 7, background: '#2563eb', borderRadius: '50%' }} />}
            </button>

            <button className="cm-tbtn" onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}>
              <Ico d={viewMode === 'grid' ? ICO.list : ICO.grid} size={13} />
              <span style={{ display: 'none' }} className="sm-inline">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
            </button>

            <button className="cm-tbtn" onClick={fetchCourses} title="Refresh" style={{ padding: '8px 12px' }}>
              <Ico d={ICO.refresh} size={13} />
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div>
              <div className="cm-filters">
                <div>
                  <div className="cm-filter-label">Category</div>
                  <input className="cm-filter-input" type="text" name="category"
                    value={filters.category} onChange={handleFilterChange} placeholder="e.g. Technology" />
                </div>
                <div>
                  <div className="cm-filter-label">Level</div>
                  <select className="cm-filter-select" name="level" value={filters.level} onChange={handleFilterChange}>
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
                <div>
                  <div className="cm-filter-label">Status</div>
                  <select className="cm-filter-select" name="isActive" value={filters.isActive} onChange={handleFilterChange}>
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <div className="cm-filter-label">Sort By</div>
                  <select className="cm-filter-select" name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                    <option value="popularity">Most Popular</option>
                  </select>
                </div>
              </div>
              {hasActiveFilters && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <button className="cm-filter-clear" onClick={clearFilters}>Clear all filters</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="cm-loader-wrap"><div className="cm-loader" /></div>
        ) : courses.length === 0 ? (
          <div className="cm-empty">
            <div className="cm-empty-icon">📚</div>
            <div className="cm-empty-title">No Courses Found</div>
            <p className="cm-empty-sub">Get started by adding your first course</p>
            <button className="cm-btn cm-btn-primary" onClick={() => setDrawer({ open: true, mode: 'add' })}>
              <Ico d={ICO.plus} size={14} /> Add Your First Course
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="cm-grid">
            {courses.map((course, i) => (
              <div className="cm-card" key={course._id} style={{ animationDelay: `${i * 0.04}s` }}>
                {/* Image */}
                <div className="cm-card-img">
                  {course.thumbnail
                    ? <img src={course.thumbnail} alt={course.name} onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/400x200/dbeafe/2563eb?text=${encodeURIComponent(course.name.slice(0, 2))}` }} />
                    : <div className="cm-card-img-placeholder">🎓</div>
                  }
                  <div className="cm-card-img-overlay" />
                  {course.discount?.isDiscounted && (
                    <span className="cm-chip cm-chip-discount">{course.discount.discountPercentage}% OFF</span>
                  )}
                  {course.popularity?.featured && (
                    <span className="cm-chip cm-chip-featured"><Ico d={ICO.star} size={9} /> Featured</span>
                  )}
                  <button
                    className={`cm-status-toggle ${course.isActive ? 'active-st' : 'inactive-st'}`}
                    onClick={() => handleToggleStatus(course)}
                    title={course.isActive ? 'Click to deactivate' : 'Click to activate'}
                  >
                    {course.isActive ? '● Active' : '○ Inactive'}
                  </button>
                </div>

                {/* Body */}
                <div className="cm-card-body">
                  <div className="cm-card-title">{course.name}</div>
                  <div className="cm-card-code">{course.code}</div>
                  <LevelBadge level={course.level} />
                  <p className="cm-card-desc">{course.shortDescription}</p>

                  <div className="cm-card-meta">
                    <div className="cm-meta-item"><Ico d={ICO.clock} size={11} className="cm-meta-icon" />{course.duration?.value} {course.duration?.unit}</div>
                    <div className="cm-meta-item"><Ico d={ICO.users} size={11} className="cm-meta-icon" />{course.popularity?.enrollments || 0} enrolled</div>
                    <div className="cm-meta-item"><Ico d={ICO.star} size={11} className="cm-meta-icon" style={{ color: '#f59e0b' }} />{course.rating?.average?.toFixed(1) || '—'} ({course.rating?.count || 0})</div>
                    <div className="cm-meta-item"><Ico d={ICO.cert} size={11} className="cm-meta-icon" />{course.certificateProvided ? 'Certificate' : 'No cert'}</div>
                  </div>

                  <div className="cm-price">
                    {course.discount?.isDiscounted ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                        <span className="cm-price-orig">₹{course.totalFees?.toLocaleString('en-IN')}</span>
                        <span className={`cm-price-main cm-price-discount`}>₹{getCurrentPrice(course)?.toLocaleString('en-IN')}</span>
                        <span className="cm-price-save">Save {course.discount.discountPercentage}%</span>
                      </div>
                    ) : (
                      <span className={`cm-price-main cm-price-regular`}>₹{course.totalFees?.toLocaleString('en-IN')}</span>
                    )}
                  </div>

                  <div className="cm-card-actions">
                    <button className="cm-action-btn view" onClick={() => { setSelected(course); setViewOpen(true) }}>
                      <Ico d={ICO.eye} size={12} /> View
                    </button>
                    <button className="cm-action-btn edit" onClick={() => { setSelected(course); setDrawer({ open: true, mode: 'edit' }) }}>
                      <Ico d={ICO.edit} size={12} /> Edit
                    </button>
                    <button className="cm-action-btn delete" onClick={() => { setSelected(course); setConfirmOpen(true) }}>
                      <Ico d={ICO.trash} size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="cm-table-wrap">
            <div style={{ overflowX: 'auto' }}>
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Level</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Enrollments</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="cm-table-avatar">
                            {course.thumbnail
                              ? <img src={course.thumbnail} alt="" onError={e => { e.target.onerror = null; e.target.src = '' }} />
                              : '🎓'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>{course.name}</div>
                            <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{course.code}</div>
                          </div>
                        </div>
                      </td>
                      <td><LevelBadge level={course.level} /></td>
                      <td>{course.duration?.value} {course.duration?.unit}</td>
                      <td>
                        {course.discount?.isDiscounted ? (
                          <div>
                            <div style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'line-through' }}>₹{course.totalFees?.toLocaleString('en-IN')}</div>
                            <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 14 }}>₹{getCurrentPrice(course)?.toLocaleString('en-IN')}</div>
                          </div>
                        ) : (
                          <span style={{ fontWeight: 600, color: '#2563eb' }}>₹{course.totalFees?.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td>{course.popularity?.enrollments || 0}</td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(course)}
                          style={{
                            padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                            fontSize: 12, fontWeight: 600, fontFamily: 'Figtree, sans-serif',
                            background: course.isActive ? '#d1fae5' : '#f1f5f9',
                            color: course.isActive ? '#065f46' : '#475569',
                            transition: 'all 0.15s',
                          }}
                        >
                          {course.isActive ? '● Active' : '○ Inactive'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button className="cm-action-btn view" style={{ flex: 'none', padding: '6px 8px' }} onClick={() => { setSelected(course); setViewOpen(true) }} title="View">
                            <Ico d={ICO.eye} size={14} />
                          </button>
                          <button className="cm-action-btn edit" style={{ flex: 'none', padding: '6px 8px' }} onClick={() => { setSelected(course); setDrawer({ open: true, mode: 'edit' }) }} title="Edit">
                            <Ico d={ICO.edit} size={14} />
                          </button>
                          <button className="cm-action-btn delete" style={{ flex: 'none', padding: '6px 8px' }} onClick={() => { setSelected(course); setConfirmOpen(true) }} title="Delete">
                            <Ico d={ICO.trash} size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="cm-pagination">
            <button className="cm-pg-btn" onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}>
              <Ico d={ICO.chev_l} size={14} />
            </button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const p = pagination
              let n = p.pages <= 5 ? i + 1 : p.page <= 3 ? i + 1 : p.page >= p.pages - 2 ? p.pages - 4 + i : p.page - 2 + i
              return (
                <button key={n} className={`cm-pg-btn ${p.page === n ? 'current' : ''}`} onClick={() => setPagination(pp => ({ ...pp, page: n }))}>{n}</button>
              )
            })}
            <button className="cm-pg-btn" onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.pages}>
              <Ico d={ICO.chev_r} size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ─── Drawer: Add / Edit ─── */}
      <Drawer
        open={drawer.open}
        onClose={() => { setDrawer({ open: false, mode: 'add' }); setSelected(null) }}
        title={drawer.mode === 'edit' ? `Edit — ${selected?.name || 'Course'}` : 'Add New Course'}
      >
        <CourseForm
          course={drawer.mode === 'edit' ? selected : null}
          onSuccess={() => { setDrawer({ open: false, mode: 'add' }); setSelected(null); fetchCourses() }}
        />
      </Drawer>

      {/* ─── View Dialog ─── */}
      <Dialog open={viewOpen} onClose={() => { setViewOpen(false); setSelected(null) }} title="Course Details">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Hero */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ width: 80, height: 80, borderRadius: 14, background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
                🎓
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{selected.name}</h2>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{selected.code}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <LevelBadge level={selected.level} />
                  {selected.certificateProvided && <span className="cm-level cm-level-beginner"><Ico d={ICO.cert} size={10} /> Certificate</span>}
                  {selected.isActive ? <span className="cm-level" style={{ background: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' }}>Active</span> : <span className="cm-level cm-level-default">Inactive</span>}
                </div>
              </div>
            </div>

            {/* Description */}
            {selected.shortDescription && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>About</div>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65 }}>{selected.shortDescription}</p>
              </div>
            )}

            {/* Details grid */}
            <div className="cm-detail-grid">
              <div className="cm-detail-card">
                <div className="cm-detail-label">Price</div>
                <div className="cm-detail-val" style={{ color: selected.discount?.isDiscounted ? '#dc2626' : '#2563eb' }}>
                  ₹{getCurrentPrice(selected)?.toLocaleString('en-IN')}
                </div>
                {selected.discount?.isDiscounted && (
                  <div style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through' }}>₹{selected.totalFees?.toLocaleString('en-IN')}</div>
                )}
              </div>
              <div className="cm-detail-card">
                <div className="cm-detail-label">Duration</div>
                <div className="cm-detail-val">{selected.duration?.value} {selected.duration?.unit}</div>
              </div>
              <div className="cm-detail-card">
                <div className="cm-detail-label">Enrollments</div>
                <div className="cm-detail-val">{selected.popularity?.enrollments || 0}</div>
              </div>
              <div className="cm-detail-card">
                <div className="cm-detail-label">Rating</div>
                <div className="cm-detail-val">{selected.rating?.average?.toFixed(1) || '—'} <span style={{ fontSize: 12, color: '#94a3b8' }}>({selected.rating?.count || 0} reviews)</span></div>
              </div>
            </div>

            {/* Tags */}
            {selected.tags?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Tags</div>
                <div>{selected.tags.map(t => <span key={t} className="cm-tag">{t}</span>)}</div>
              </div>
            )}

            {/* Footer actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4, borderTop: '1px solid #f1f5f9' }}>
              <button className="cm-btn cm-btn-ghost cm-btn-sm" onClick={() => setViewOpen(false)}>Close</button>
              <button className="cm-btn cm-btn-primary cm-btn-sm" onClick={() => {
                setViewOpen(false)
                setDrawer({ open: true, mode: 'edit' })
              }}>
                <Ico d={ICO.edit} size={13} /> Edit Course
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ─── Confirm Delete ─── */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setSelected(null) }}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Course"
        message={`Are you sure you want to permanently delete "${selected?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}

export default CourseManagement