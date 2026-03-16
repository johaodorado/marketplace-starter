"use client"

import { Sora } from 'next/font/google'
import { useEffect, useMemo, useRef, useState } from 'react'

type HeroRotatorProps = {
  images: string[]
  alt?: string
  intervalMs?: number
}

const sora = Sora({ subsets: ['latin'], weight: ['600', '700'] })

export default function HeroRotator({
  images,
  alt = 'Acuario',
  intervalMs = 6000,
}: HeroRotatorProps) {
  const fadeMs = 1200

  const cleanedImages = useMemo(
    () => images.filter((image) => image.trim().length > 0),
    [images],
  )

  const [activeIndex, setActiveIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const activeIndexRef = useRef(0)
  const isTransitioningRef = useRef(false)

  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  useEffect(() => {
    isTransitioningRef.current = isTransitioning
  }, [isTransitioning])

  useEffect(() => {
    cleanedImages.forEach((imagePath) => {
      const image = new window.Image()
      image.src = imagePath
    })
  }, [cleanedImages])

  useEffect(() => {
    if (cleanedImages.length <= 1) {
      return
    }

    let fadeTimeoutId: number | undefined
    let frameId: number | undefined

    const intervalId = window.setInterval(() => {
      if (isTransitioningRef.current) {
        return
      }

      const upcoming = (activeIndexRef.current + 1) % cleanedImages.length
      setNextIndex(upcoming)

      frameId = window.requestAnimationFrame(() => {
        setIsTransitioning(true)
      })

      fadeTimeoutId = window.setTimeout(() => {
        setActiveIndex(upcoming)
        setIsTransitioning(false)
        setNextIndex(null)
      }, fadeMs)
    }, intervalMs)

    return () => {
      window.clearInterval(intervalId)
      if (fadeTimeoutId !== undefined) {
        window.clearTimeout(fadeTimeoutId)
      }
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [cleanedImages.length, fadeMs, intervalMs])

  if (cleanedImages.length === 0) {
    return null
  }

  return (
    <section className="hero">
      <img
        className="hero-image hero-image-layer is-visible"
        src={cleanedImages[activeIndex]}
        alt={alt}
      />
      {nextIndex !== null && (
        <img
          className={`hero-image hero-image-layer hero-image-next ${isTransitioning ? 'is-fading-in' : 'is-hidden'}`}
          src={cleanedImages[nextIndex]}
          alt={alt}
        />
      )}
      <div className="hero-overlay">
        <h1 className={sora.className}>
          Soluciones acuicolas de precision
          <br />
          para un crecimiento saludable y
          <br />
          resultados extraordinarios
        </h1>
      </div>
    </section>
  )
}