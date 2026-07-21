import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './UpiSimulatorPage.css'

// Sound synthesis utility for fast, zero-asset sound effects
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    if (type === 'ping') {
      // Notification sound
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } else if (type === 'tick') {
      // Keypad tick
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(400, ctx.currentTime)
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } else if (type === 'buzzer') {
      // Error buzzer
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(150, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.5)
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
    } else if (type === 'success') {
      // Success chime
      osc.type = 'sine'
      osc.frequency.setValueAtTime(400, ctx.currentTime)
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1)
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2)
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6)
      osc.start()
      osc.stop(ctx.currentTime + 0.6)
    }
  } catch (e) {
    console.log("Audio not supported or blocked", e)
  }
}

const SCENARIOS = [
  {
    id: 'olx',
    name: 'OLX Sofa Buyer Scam',
    description: 'Someone is buying your sofa on OLX. They say they are sending you ₹5,000 as advance.',
    scammerName: 'Ramesh Kumar (OLX)',
    amount: '₹5,000',
    type: 'request',
    theme: 'upi-theme-purple', // PhonePe style
    message: 'Advance payment for sofa. Just enter PIN to receive money instantly in your bank.',
    warningTitle: '🚨 SCAM ALERT: YOU JUST SENT MONEY!',
    warningText: 'You entered your UPI PIN for a "Receive" request. UPI PIN is ONLY used to SEND money from your bank account. You never need a PIN to receive money.',
  },
  {
    id: 'refund',
    name: 'Fake Customer Care Refund',
    description: 'You complained about a delayed flight. "Customer Care" sent a link to process your refund of ₹12,500.',
    scammerName: 'Indigo Airlines Support',
    amount: '₹12,500',
    type: 'request',
    theme: 'upi-theme-google', // GPay style (generic light)
    message: 'REFUND_TXN_8849. Please authorize to receive your refund amount into your linked account.',
    warningTitle: '🚨 SCAM ALERT: FAKE REFUND TRICK!',
    warningText: 'Customer support will NEVER send you a payment request to process a refund. By entering your PIN, you authorized a PAYMENT to the scammer.',
  },
  {
    id: 'shop',
    name: 'Real Shop Payment (Safe)',
    description: 'You are paying at the local grocery store for milk and bread.',
    scammerName: 'Gupta General Store',
    amount: '₹140',
    type: 'send',
    theme: 'upi-theme-purple',
    message: 'Grocery bill',
    warningTitle: '✅ PAYMENT SUCCESSFUL',
    warningText: 'Good job! You correctly used your UPI PIN to SEND money to a merchant. This was a safe, standard transaction.',
    isSafe: true
  }
]

export default function UpiSimulatorPage() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0])
  const [currentScreen, setCurrentScreen] = useState('home')
  const [pin, setPin] = useState('')
  const [timer, setTimer] = useState(299) // 4:59
  const [isShaking, setIsShaking] = useState(false)
  
  // 3D Tilt State
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const phoneRef = useRef(null)

  useEffect(() => {
    let interval;
    if (currentScreen === 'request' || currentScreen === 'pin') {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 10 && prev > 0 && prev % 2 === 0) {
            // Trigger panic shake when time is very low
            setIsShaking(true)
            setTimeout(() => setIsShaking(false), 500)
          }
          return prev > 0 ? prev - 1 : 0
        })
      }, 1000)
    } else {
      setTimer(299) // Reset
    }
    return () => clearInterval(interval)
  }, [currentScreen])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `0${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleMouseMove = (e) => {
    if (!phoneRef.current) return
    const rect = phoneRef.current.getBoundingClientRect()
    // Calculate mouse position relative to the center of the phone
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    // Convert to rotation degrees (max tilt 15 degrees)
    const rotateXValue = -(y / (rect.height / 2)) * 12
    const rotateYValue = (x / (rect.width / 2)) * 12
    
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    // Reset tilt
    setRotateX(0)
    setRotateY(0)
  }

  const handleScenarioChange = (scenario) => {
    setActiveScenario(scenario)
    setCurrentScreen('home')
    setPin('')
  }

  const startScenario = () => {
    playSound('ping')
    setCurrentScreen('request')
  }

  const handlePayClick = () => {
    playSound('tick')
    setCurrentScreen('pin')
  }

  const handleDeclineClick = () => {
    if (activeScenario.isSafe) {
      playSound('buzzer')
      setCurrentScreen('result_declined_safe')
    } else {
      playSound('success')
      setCurrentScreen('result_saved')
    }
  }

  const handlePinInput = (num) => {
    if (pin.length < 4) {
      playSound('tick')
      const newPin = pin + num
      setPin(newPin)
      if (newPin.length === 4) {
        setTimeout(() => {
          if (activeScenario.isSafe) {
            playSound('success')
          } else {
            playSound('buzzer')
          }
          setCurrentScreen('result')
        }, 500)
      }
    }
  }

  const handleBackspace = () => {
    playSound('tick')
    setPin(pin.slice(0, -1))
  }

  return (
    <div className="h-screen pt-24 pb-4 px-4 sm:px-6 lg:px-8 relative z-10 bg-zinc-50 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight mb-1">
            UPI Fraud <span className="text-blue-600">Simulator 3D</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-500 font-medium max-w-2xl mx-auto">
            Experience real-world UPI scams in a fully interactive 3D environment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1 pb-4">
          
          {/* LEFT PANEL: Scenarios List */}
          <div className="lg:col-span-4 bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-200 p-6 flex flex-col gap-4 relative z-20">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Select a Training Module</h3>
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScenarioChange(s)}
                className={`p-4 rounded-2xl text-left border-2 ${activeScenario.id === s.id ? 'border-blue-600 bg-blue-50/50 shadow-md transform scale-[1.02]' : 'border-transparent bg-zinc-100 hover:bg-zinc-200'} transition-all duration-300`}
              >
                <h4 className={`font-bold text-base ${activeScenario.id === s.id ? 'text-blue-700' : 'text-zinc-900'}`}>{s.name}</h4>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{s.description}</p>
              </button>
            ))}

            <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💡</span>
                <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Golden Rule</p>
              </div>
              <p className="text-xs text-yellow-900 font-medium leading-relaxed">
                You <b>NEVER</b> need to enter your UPI PIN to receive money.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: 3D Smartphone Mockup */}
          <div className="lg:col-span-8 flex justify-center py-4">
            
            <div 
              className="smartphone-3d-container"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                ref={phoneRef}
                className={`smartphone-mockup ${isShaking ? 'shake-animation' : ''}`}
                style={{
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                }}
              >
                <div className="smartphone-glare"></div>
                <div className="smartphone-notch"></div>
                
                <div className="smartphone-status-bar">
                  <span>10:41</span>
                  <div className="flex gap-1 items-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 22 1.34-21.4 1.34-20.67V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                  </div>
                </div>

                {/* Screens */}
                <AnimatePresence mode="wait">
                  
                  {currentScreen === 'home' && (
                    <motion.div 
                      key="home"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center p-6 text-center z-20 depth-element-1"
                    >
                      <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                      </div>
                      <h2 className="text-2xl font-bold text-zinc-900 mb-3">Ready to test?</h2>
                      <p className="text-zinc-500 mb-10 text-base max-w-[250px]">You will receive a simulated notification on this device for the selected scenario.</p>
                      
                      {/* Depth Button */}
                      <button 
                        onClick={startScenario}
                        className="depth-element-2 px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all w-full relative overflow-hidden"
                      >
                        <span className="relative z-10">Trigger Notification</span>
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full hover:animate-[shimmer_1s_forwards]"></div>
                      </button>
                    </motion.div>
                  )}

                  {currentScreen === 'request' && (
                    <motion.div 
                      key="request"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`flex-1 flex flex-col bg-slate-50 z-20 ${activeScenario.theme}`}
                    >
                      <div className="upi-app-header">
                        <button onClick={() => setCurrentScreen('home')} className="upi-back-btn">←</button>
                        <span className="font-bold header-title text-lg">Payment Request</span>
                      </div>

                      <div className="upi-app-body items-center text-center">
                        
                        <div className="urgency-timer depth-element-1 mb-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Expires in {formatTime(timer)}
                        </div>

                        <div className="user-avatar-placeholder mt-2 depth-element-1">
                          {activeScenario.scammerName.charAt(0)}
                        </div>
                        
                        <div className="mt-3 depth-element-1">
                          <h2 className="text-xl font-bold text-zinc-900">{activeScenario.scammerName}</h2>
                          <p className="text-sm text-zinc-500 font-medium mt-1">has requested money from you</p>
                        </div>

                        <div className="text-4xl font-extrabold text-zinc-900 my-4 depth-element-2 tracking-tight">
                          {activeScenario.amount}
                        </div>

                        <div className="bg-white w-full rounded-xl p-4 shadow-sm border border-zinc-200 text-left depth-element-1">
                          <p className="text-[10px] text-zinc-400 mb-1 uppercase tracking-widest font-bold">Message attached</p>
                          <p className="text-sm font-medium text-zinc-800 leading-snug">"{activeScenario.message}"</p>
                        </div>

                        <div className="mt-auto w-full flex flex-col gap-2 depth-element-2 pb-2">
                          <button 
                            onClick={handlePayClick}
                            className="w-full py-3 bg-zinc-900 text-white font-bold text-base rounded-xl shadow-xl shadow-zinc-900/20 active:scale-95 transition-transform"
                          >
                            Proceed to Pay
                          </button>
                          <button 
                            onClick={handleDeclineClick}
                            className="w-full py-3 bg-white text-zinc-600 border-2 border-zinc-200 font-bold text-base rounded-xl hover:bg-zinc-50 hover:text-zinc-900 active:scale-95 transition-all"
                          >
                            Decline Request
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentScreen === 'pin' && (
                    <motion.div 
                      key="pin"
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="pin-screen-overlay"
                    >
                      <div className="flex justify-between items-center mb-10 depth-element-1">
                        <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Enter UPI PIN</span>
                        <button onClick={() => setCurrentScreen('request')} className="text-3xl font-light hover:scale-110 transition-transform">×</button>
                      </div>

                      <div className="text-center depth-element-2">
                        <p className="text-sm opacity-80 mb-2 font-medium">Paying to</p>
                        <h2 className="text-2xl font-bold mb-1">{activeScenario.scammerName}</h2>
                        <div className="inline-block px-3 py-1 bg-white/10 rounded-full mt-2">
                          <p className="text-sm font-medium">Sending {activeScenario.amount}</p>
                        </div>
                      </div>

                      <div className="pin-dots depth-element-2">
                        {[1, 2, 3, 4].map((dot, idx) => (
                          <div key={idx} className={`pin-dot ${pin.length > idx ? 'filled' : ''}`}></div>
                        ))}
                      </div>

                      <div className="pin-keypad depth-element-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <button key={num} onClick={() => handlePinInput(num)} className="pin-key">{num}</button>
                        ))}
                        <div></div>
                        <button onClick={() => handlePinInput(0)} className="pin-key">0</button>
                        <button onClick={handleBackspace} className="pin-key flex items-center justify-center">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"></path></svg>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentScreen === 'result' && (
                    <motion.div 
                      key="result"
                      className="warning-screen"
                    >
                      <div className="depth-element-3 flex flex-col items-center">
                        <div className="warning-icon">
                          {activeScenario.isSafe ? '✅' : '⚠️'}
                        </div>
                        <h2 className="text-3xl font-extrabold mb-4">{activeScenario.warningTitle}</h2>
                        <p className="text-lg opacity-90 mb-10 max-w-[280px] leading-relaxed font-medium">
                          {activeScenario.warningText}
                        </p>
                        <button 
                          onClick={() => setCurrentScreen('home')}
                          className="px-8 py-4 bg-white text-black font-bold text-lg rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                        >
                          Try Another Scenario
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentScreen === 'result_saved' && (
                    <motion.div 
                      key="result_saved"
                      className="warning-screen"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.95)' }}
                    >
                      <div className="depth-element-3 flex flex-col items-center">
                        <div className="warning-icon">🛡️</div>
                        <h2 className="text-3xl font-extrabold mb-4">SMART MOVE!</h2>
                        <p className="text-lg opacity-90 mb-10 max-w-[280px] leading-relaxed font-medium">
                          You correctly identified this as a scam and declined it. You just saved yourself {activeScenario.amount}!
                        </p>
                        <button 
                          onClick={() => setCurrentScreen('home')}
                          className="px-8 py-4 bg-white text-green-700 font-bold text-lg rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                        >
                          Continue Training
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentScreen === 'result_declined_safe' && (
                    <motion.div 
                      key="result_declined_safe"
                      className="warning-screen"
                      style={{ backgroundColor: 'rgba(245, 158, 11, 0.95)' }}
                    >
                      <div className="depth-element-3 flex flex-col items-center">
                        <div className="warning-icon">🤔</div>
                        <h2 className="text-3xl font-extrabold mb-4">Payment Declined</h2>
                        <p className="text-lg opacity-90 mb-10 max-w-[280px] leading-relaxed font-medium">
                          You declined a legitimate payment to {activeScenario.scammerName}. It's good to be cautious, but this was actually safe!
                        </p>
                        <button 
                          onClick={() => setCurrentScreen('home')}
                          className="px-8 py-4 bg-white text-orange-700 font-bold text-lg rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                        >
                          Try Again
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
