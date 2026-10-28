import { useEffect } from 'react'

export default function Modal({ wide, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={wide ? 'modal wide' : 'modal'} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="modal-header">
      <div>
        <h3>{title}</h3>
        {subtitle && <div className="muted">{subtitle}</div>}
      </div>
      <button className="close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  )
}
