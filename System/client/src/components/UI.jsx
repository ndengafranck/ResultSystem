/**
 * UI.jsx — Shared components imported across the whole app.
 * Import what you need:
 *   import { Alert, Spinner, PageLoader, Card, Badge, StatusBadge,
 *            ActionBtn, HeroSection, SectionTitle, ModalOverlay } from '../components/UI';
 */

import React from 'react';
import styled, { keyframes, css } from 'styled-components';

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeUp   = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}`;
const fadeIn   = keyframes`from{opacity:0}to{opacity:1}`;
const spin     = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const pulse    = keyframes`0%,100%{opacity:1}50%{opacity:.4}`;
const slideIn  = keyframes`from{transform:translateY(-12px);opacity:0}to{transform:none;opacity:1}`;

// ─── Alert / Message ─────────────────────────────────────────────────────────
const ALERT_VARIANTS = {
  success: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0', icon: '✓' },
  error:   { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', icon: '✕' },
  warning: { bg: '#fef9c3', color: '#92400e', border: '#fde68a', icon: '⚠' },
  info:    { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', icon: 'ℹ' },
};

const AlertWrap = styled.div`
  display: flex;
  align-items: flex-start;
  gap: .65rem;
  padding: .85rem 1.1rem;
  border-radius: 8px;
  border: 1px solid ${p => (ALERT_VARIANTS[p.$v] || ALERT_VARIANTS.info).border};
  background: ${p => (ALERT_VARIANTS[p.$v] || ALERT_VARIANTS.info).bg};
  color: ${p => (ALERT_VARIANTS[p.$v] || ALERT_VARIANTS.info).color};
  font-size: .875rem;
  font-weight: 500;
  animation: ${slideIn} .25s ease both;
  margin-bottom: ${p => p.$mb || '0'};
`;
const AlertIcon = styled.span`font-size:1rem;flex-shrink:0;margin-top:.05rem;`;
const AlertBody = styled.div`flex:1;line-height:1.5;`;
const AlertTitle= styled.div`font-weight:700;margin-bottom:.15rem;`;

/**
 * <Alert variant="success|error|warning|info" title="Optional title" mb="1rem">
 *   Message text here
 * </Alert>
 */
export const Alert = ({ variant = 'info', title, children, mb, style }) => {
  if (!children) return null;
  const v = ALERT_VARIANTS[variant] || ALERT_VARIANTS.info;
  return (
    <AlertWrap $v={variant} $mb={mb} style={style}>
      <AlertIcon>{v.icon}</AlertIcon>
      <AlertBody>
        {title && <AlertTitle>{title}</AlertTitle>}
        {children}
      </AlertBody>
    </AlertWrap>
  );
};

// ─── Spinner ─────────────────────────────────────────────────────────────────
const SpinRing = styled.span`
  display: inline-block;
  width: ${p => p.$size || '20px'};
  height: ${p => p.$size || '20px'};
  border: ${p => p.$stroke || '2.5px'} solid ${p => p.$track || 'rgba(255,255,255,.3)'};
  border-top-color: ${p => p.$color || 'white'};
  border-radius: 50%;
  animation: ${spin} .7s linear infinite;
  flex-shrink: 0;
`;

/**
 * Inline spinner — adapts colour/size to context.
 * <Spinner />                        — small white (for buttons)
 * <Spinner color="#1e3a8a" track="#e2e8f0" size="28px" stroke="3px" />
 */
export const Spinner = ({ color, track, size, stroke, style }) => (
  <SpinRing $color={color} $track={track} $size={size} $stroke={stroke} style={style} />
);

// ─── Page-level loader (full page overlay while loading content) ──────────────
const LoaderWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${p => p.$full ? '100vh' : '280px'};
  gap: 1rem;
  color: var(--text-secondary);
  animation: ${fadeIn} .3s ease;
`;
const LoaderRing = styled.div`
  width: ${p => p.$size || '40px'};
  height: ${p => p.$size || '40px'};
  border: 3.5px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: ${spin} .75s linear infinite;
`;
const LoaderText = styled.p`
  margin: 0;
  font-size: .88rem;
  font-weight: 500;
  animation: ${pulse} 1.8s ease infinite;
`;

/**
 * <PageLoader />                 — centred spinner with default label
 * <PageLoader label="Signing in…" full />   — full-screen height
 * <PageLoader size="56px" />
 */
export const PageLoader = ({ label = 'Loading…', full, size }) => (
  <LoaderWrap $full={full}>
    <LoaderRing $size={size} />
    <LoaderText>{label}</LoaderText>
  </LoaderWrap>
);

// ─── Sync overlay — disables whole page while syncing ────────────────────────
const SyncOverlayWrap = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, .55);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  animation: ${fadeIn} .2s ease;
  backdrop-filter: blur(2px);
`;
const SyncCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: 2rem 2.5rem;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-width: 240px;
`;
const SyncTitle = styled.p`margin:0;font-weight:700;color:var(--primary);font-size:1rem;`;
const SyncSub   = styled.p`margin:0;font-size:.8rem;color:var(--text-secondary);`;

/**
 * <SyncOverlay /> — render this when isSyncing is true.
 * It blocks ALL interaction with a full-screen overlay.
 */
export const SyncOverlay = () => (
  <SyncOverlayWrap>
    <SyncCard>
      <Spinner color="var(--primary)" track="#e2e8f0" size="44px" stroke="4px" />
      <div>
        <SyncTitle>Synchronising databases…</SyncTitle>
        <SyncSub>Please wait. Do not close this window.</SyncSub>
      </div>
    </SyncCard>
  </SyncOverlayWrap>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = styled.div`
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: ${p => p.$p || '1.5rem'};
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
  animation: ${fadeUp} .4s ease both;
  animation-delay: ${p => p.$d || '0s'};
`;

// ─── Stat card ───────────────────────────────────────────────────────────────
export const StatCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: .6rem;
  transition: transform .2s, box-shadow .2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(30,58,138,.09); }
`;

// ─── Icon box (coloured square behind icons in stat cards) ───────────────────
export const IconBox = styled.div`
  width: ${p => p.$size || '42px'};
  height: ${p => p.$size || '42px'};
  border-radius: 10px;
  background: ${p => p.$bg || '#e0e7ff'};
  color: ${p => p.$c || 'var(--primary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${p => p.$fs || '1.15rem'};
  flex-shrink: 0;
`;

// ─── Status badge (Pending / Validated / Rejected / generic) ─────────────────
const STATUS_MAP = {
  Pending:   { bg: '#fef9c3', color: '#92400e' },
  Validated: { bg: '#dcfce7', color: '#16a34a' },
  Rejected:  { bg: '#fee2e2', color: '#dc2626' },
  Submitted: { bg: '#e0f2fe', color: '#0369a1' },
  Approved:  { bg: '#dcfce7', color: '#16a34a' },
  Responded: { bg: '#fef9c3', color: '#ca8a04' },
  Solved:    { bg: '#dcfce7', color: '#166534' },
  Enrolled:  { bg: '#dcfce7', color: '#16a34a' },
  Completed: { bg: '#dbeafe', color: '#1d4ed8' },
  Suspended: { bg: '#fee2e2', color: '#dc2626' },
};

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .25rem .75rem;
  border-radius: 20px;
  font-size: .75rem;
  font-weight: 700;
  background: ${p => (STATUS_MAP[p.$s] || { bg: '#f3f4f6' }).bg};
  color: ${p => (STATUS_MAP[p.$s] || { color: '#374151' }).color};
`;

// ─── Generic badge ────────────────────────────────────────────────────────────
export const Badge = styled.span`
  display: inline-block;
  padding: .22rem .7rem;
  border-radius: 20px;
  font-size: .72rem;
  font-weight: 700;
  background: ${p => p.$bg || '#e0e7ff'};
  color: ${p => p.$c || '#3730a3'};
`;

// ─── Action button ────────────────────────────────────────────────────────────
export const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .45rem;
  padding: ${p => p.$sm ? '.4rem .9rem' : '.6rem 1.25rem'};
  border-radius: 8px;
  font-weight: 600;
  font-size: ${p => p.$sm ? '.8rem' : '.88rem'};
  cursor: pointer;
  transition: all .2s;
  border: 1.5px solid ${p =>
    p.$danger  ? 'var(--danger)' :
    p.$success ? '#16a34a' :
    p.$ghost   ? 'var(--border-color)' :
    'var(--primary)'
  };
  background: ${p =>
    p.$danger  ? 'var(--danger)' :
    p.$success ? '#16a34a' :
    p.$ghost   ? 'white' :
    p.$outline ? 'transparent' :
    'var(--primary)'
  };
  color: ${p =>
    p.$ghost   ? 'var(--text-secondary)' :
    p.$outline ? 'var(--primary)' :
    'white'
  };
  opacity: ${p => p.disabled ? '.55' : '1'};
  pointer-events: ${p => p.disabled ? 'none' : 'auto'};
  &:hover { opacity: .85; }
`;

// ─── Form group ───────────────────────────────────────────────────────────────
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: .4rem;
  label {
    font-weight: 600;
    font-size: .83rem;
    color: var(--text-primary);
  }
  select, input, textarea {
    padding: .65rem .85rem;
    border: 1.5px solid var(--border-color);
    border-radius: 8px;
    font-family: inherit;
    font-size: .9rem;
    outline: none;
    transition: border-color .2s;
    &:focus { border-color: var(--primary); }
  }
`;

// ─── Page hero banner ─────────────────────────────────────────────────────────
export const HeroSection = styled.div`
  background: linear-gradient(135deg, var(--primary) 55%, #1d4ed8);
  border-radius: 16px;
  padding: 2rem 2.5rem;
  color: white;
  margin-bottom: ${p => p.$mb || '2rem'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;
export const HeroTitle = styled.h2`margin: 0 0 .2rem; color: white; font-size: 1.7rem;`;
export const HeroSub   = styled.p`margin: 0; opacity: .7; font-size: .88rem;`;

// ─── Section title ────────────────────────────────────────────────────────────
export const SectionTitle = styled.h3`
  font-size: .75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--text-secondary);
  margin: 0 0 1rem;
`;

// ─── Page fade-in wrapper ─────────────────────────────────────────────────────
export const PageWrap = styled.div`animation: ${fadeUp} .4s ease both;`;

// ─── Modal overlay + modal box ────────────────────────────────────────────────
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: ${fadeIn} .2s ease;
`;
export const ModalBox = styled.div`
  background: white;
  border-radius: 14px;
  width: 100%;
  max-width: ${p => p.$w || '860px'};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,.3);
`;
export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: #f8fafc;
  flex-shrink: 0;
`;

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyWrap = styled.div`
  padding: 3.5rem 2rem;
  text-align: center;
  color: var(--text-secondary);
  background: white;
  border-radius: 14px;
  border: 1px solid var(--border-color);
`;
export const EmptyState = ({ icon, title = 'Nothing here', message }) => (
  <EmptyWrap>
    {icon && <div style={{ fontSize: '2.5rem', opacity: .3, marginBottom: '1rem' }}>{icon}</div>}
    <h3 style={{ margin: '0 0 .5rem', color: 'var(--text-primary)' }}>{title}</h3>
    {message && <p style={{ margin: 0, fontSize: '.875rem' }}>{message}</p>}
  </EmptyWrap>
);

// ─── Filter button row ────────────────────────────────────────────────────────
export const FilterRow = styled.div`
  display: flex;
  gap: .75rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1.5rem;
`;
export const FilterBtn = styled.button`
  padding: .38rem .95rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: .8rem;
  cursor: pointer;
  transition: all .2s;
  border: 1.5px solid ${p => p.$active ? 'var(--primary)' : 'var(--border-color)'};
  background: ${p => p.$active ? 'var(--primary)' : 'white'};
  color: ${p => p.$active ? 'white' : 'var(--text-secondary)'};
`;

// ─── Data table helpers ───────────────────────────────────────────────────────
export const Table     = styled.table`width:100%;border-collapse:collapse;font-size:.85rem;`;
export const Th        = styled.th`padding:.65rem 1rem;text-align:left;background:#f8fafc;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary);border-bottom:2px solid var(--border-color);`;
export const Td        = styled.td`padding:.7rem 1rem;border-bottom:1px solid #f1f5f9;`;
export const HighlightRow = styled.tr`background:#eff6ff;font-weight:700;`;
