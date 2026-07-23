export default function ProfileImageModal({ isOpen, imageSrc, onClose }) {
  if (!isOpen || !imageSrc) return null

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(2, 6, 23, 0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(6px)'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(92vw, 860px)',
          maxWidth: '100%',
          maxHeight: 'min(92vh, 860px)',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
          background: '#0f172a'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(15,23,42,0.75)',
            color: 'white',
            fontSize: 20,
            cursor: 'pointer',
            zIndex: 1
          }}
          aria-label="Close profile image"
        >
          ×
        </button>

        <img
          src={imageSrc}
          alt="Profile enlarged view"
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            maxHeight: 'min(92vh, 860px)',
            objectFit: 'contain',
            background: '#0f172a'
          }}
        />
      </div>
    </div>
  )
}
