'use client'

import { useState } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import BettingInterface from './components/BettingInterface'

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false)

  // Function to handle transition to game
  const handlePlay = () => {
    setIsPlaying(true)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      <Navbar />

      <div className="relative z-10">
        {!isPlaying ? (
          <LandingPage onPlay={handlePlay} />
        ) : (
          <BettingInterface />
        )}
      </div>

    </div>
  )
}
