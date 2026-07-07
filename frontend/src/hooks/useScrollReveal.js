import { useEffect, useRef } from 'react'

/**
 * useScrollReveal — observes elements with .reveal / .reveal-left / .reveal-right /
 * .reveal-scale / .reveal-blur classes and adds .visible when they enter the viewport.
 *
 * Usage:  const containerRef = useScrollReveal()
 *         <div ref={containerRef}> ... elements with .reveal class ... </div>
 */
export default function useScrollReveal(options = {}) {
    const ref = useRef(null)

    useEffect(() => {
const selectionRoot = ref.current || document.body

    let targets = []

    if (options.stagger && ref.current) {
        targets = Array.from(ref.current.children)
        targets.forEach(t => t.classList.add('reveal'))
    } else {
        const revealClasses = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale', '.reveal-blur']
        targets = selectionRoot.querySelectorAll(revealClasses.join(','))
        if (targets.length === 0 && ref.current && ref.current.classList.contains('reveal')) {
            targets = [ref.current]
        }
    }

    if (!targets || targets.length === 0) return

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible')
                    observer.unobserve(entry.target)
                }
            })
        },
        {
            threshold: options.threshold ?? 0.12,
            root: null,
                rootMargin: options.rootMargin ?? '0px 0px -40px 0px',
            }
        )

        targets.forEach((el) => observer.observe(el))

        const fallbackTimer = setTimeout(() => {
            targets.forEach((el) => {
                if (!el.classList.contains('visible')) {
                    el.classList.add('visible')
                }
            })
        }, options.fallbackDelay ?? 200)

        return () => {
            observer.disconnect()
            clearTimeout(fallbackTimer)
        }
    }, [options.threshold, options.rootMargin, options.stagger])

    return ref
}
