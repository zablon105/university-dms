import { useEffect, useRef } from 'react'

/**
 * Attach scroll-reveal animation via IntersectionObserver.
 * Usage:
 *   const ref = useScrollReveal()
 *   <div ref={ref} className="reveal">...</div>
 *
 * Or for a container whose children should stagger:
 *   const ref = useScrollReveal({ stagger: true })
 *   <div ref={ref} className="stagger-children">...</div>
 */
export default function useScrollReveal({ threshold = 0.12, stagger = false } = {}) {
    const ref = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const targets = stagger
            ? Array.from(el.children)
            : [el]

        // Pre-add reveal class to children when staggering
        if (stagger) {
            targets.forEach(t => t.classList.add('reveal'))
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible')
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold, rootMargin: '0px 0px -40px 0px' }
        )

        targets.forEach(t => observer.observe(t))
        return () => observer.disconnect()
    }, [threshold, stagger])

    return ref
}
