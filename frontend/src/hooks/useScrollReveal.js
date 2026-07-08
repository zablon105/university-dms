import { useEffect, useState, useCallback } from 'react'

/**
 * useScrollReveal — observes elements with .reveal / .reveal-left / .reveal-right /
 * .reveal-scale / .reveal-blur classes and adds .visible when they enter the viewport.
 *
 * Usage:  const containerRef = useScrollReveal()
 *         <div ref={containerRef}> ... elements with .reveal class ... </div>
 */
export default function useScrollReveal(options = {}) {
    const [node, setNode] = useState(null)

    // Callback ref: fires every time the DOM node it's attached to actually
    // changes (e.g. null while loading, then the real element once content mounts).
    // A plain useRef never notifies us of that change, so the effect below
    // would silently run once against a null/stale node and never re-run.
    const ref = useCallback((el) => {
        setNode(el)
    }, [])

    useEffect(() => {
        if (!node && !options.stagger) {
            // fall back to document.body only for the non-stagger, no-ref case
        }

        const selectionRoot = node || document.body

        let targets = []

        if (options.stagger) {
            if (!node) return
            targets = Array.from(node.children)
            targets.forEach(t => t.classList.add('reveal'))
        } else {
            const revealClasses = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale', '.reveal-blur']
            targets = selectionRoot.querySelectorAll(revealClasses.join(','))
            if (targets.length === 0 && node && node.classList.contains('reveal')) {
                targets = [node]
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
    }, [node, options.threshold, options.rootMargin, options.stagger])

    return ref
}