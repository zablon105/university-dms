import toast from 'react-hot-toast'

const toastBase = {
    duration: 4000,
    position: 'top-right',
}

const useToast = () => ({
    success: (msg, opts = {}) => toast.success(msg, { ...toastBase, ...opts }),
    error: (msg, opts = {}) => toast.error(msg, { ...toastBase, duration: 5000, ...opts }),
    info: (msg, opts = {}) =>
        toast(msg, {
            ...toastBase,
            icon: 'ℹ️',
            style: {
                background: '#eff6ff',
                color: '#1e3a8a',
                border: '1px solid #bfdbfe',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                padding: '12px 16px',
            },
            ...opts,
        }),
    warning: (msg, opts = {}) =>
        toast(msg, {
            ...toastBase,
            icon: '⚠️',
            style: {
                background: '#fffbeb',
                color: '#78350f',
                border: '1px solid #fde68a',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                padding: '12px 16px',
            },
            ...opts,
        }),
    promise: (promise, msgs, opts = {}) =>
        toast.promise(promise, msgs, { ...toastBase, ...opts }),
    dismiss: toast.dismiss,
})

export default useToast
