import { useEffect, useRef } from 'react'
import './App.css'
import profilePic from './assets/profile2.png'

const INITIAL_ANGLE = 40 * (Math.PI / 180) // 82 degrees → radians

const BAR_HEIGHTS = [20, 13, 22, 15, 18, 11, 25, 14, 20, 17, 24, 12, 19, 23, 16, 21, 13, 25, 15, 18]

function IDCard() {
  const armRef = useRef(null)

  useEffect(() => {
    let angle    = INITIAL_ANGLE
    let omega    = 0
    const damping  = 0.38
    const dt       = 1 / 60
    const ARM_LENGTH = 350
    let animId
    let alive      = true
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0
    let prevTime   = performance.now()
    const arm = armRef.current

    function step() {
      if (!alive || isDragging) return
      const alpha = -9.81 * Math.sin(angle) - damping * omega
      omega += alpha * dt
      angle += omega * dt
      if (arm) arm.style.transform = `rotate(${angle}rad)`
      if (Math.abs(angle) > 0.003 || Math.abs(omega) > 0.003) {
        animId = requestAnimationFrame(step)
      } else if (arm) {
        arm.style.transform = 'rotate(0rad)'
      }
    }

    const onDown = (e) => {
      isDragging = true
      cancelAnimationFrame(animId)
      omega = 0
      const ev = e.touches ? e.touches[0] : e
      prevMouseX = ev.clientX
      prevMouseY = ev.clientY
      prevTime   = performance.now()
      e.preventDefault()
    }

    const onMove = (e) => {
      if (!isDragging) return
      e.preventDefault()
      const ev      = e.touches ? e.touches[0] : e
      const now     = performance.now()
      const dx      = ev.clientX - prevMouseX
      const dy      = ev.clientY - prevMouseY
      const elapsed = (now - prevTime) / 1000

      if (elapsed > 0.005) {
        const dAngle = -(dx * Math.cos(angle) - dy * Math.sin(angle)) / ARM_LENGTH
        angle += dAngle
        const raw = dAngle / elapsed
        omega = omega * 0.6 + raw * 0.4
        omega = Math.max(-18, Math.min(18, omega))
        prevMouseX = ev.clientX
        prevMouseY = ev.clientY
        prevTime   = now
      }

      if (arm) arm.style.transform = `rotate(${angle}rad)`
    }

    const onUp = () => {
      if (!isDragging) return
      isDragging = false
      animId = requestAnimationFrame(step)
    }

    arm?.addEventListener('mousedown',  onDown)
    arm?.addEventListener('touchstart', onDown, { passive: false })
    window.addEventListener('mousemove',  onMove)
    window.addEventListener('touchmove',  onMove, { passive: false })
    window.addEventListener('mouseup',    onUp)
    window.addEventListener('touchend',   onUp)

    animId = requestAnimationFrame(step)

    return () => {
      alive = false
      cancelAnimationFrame(animId)
      arm?.removeEventListener('mousedown',  onDown)
      arm?.removeEventListener('touchstart', onDown)
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('touchmove',  onMove)
      window.removeEventListener('mouseup',    onUp)
      window.removeEventListener('touchend',   onUp)
    }
  }, [])

  return (
    <div className="pendulum-wrapper">
      <div className="pivot-pin" />
      <div
        ref={armRef}
        className="pendulum-arm"
        style={{ transform: `rotate(${INITIAL_ANGLE}rad)` }}
      >
        {/* Cloth lanyard — two fabric strands looping through the eyelet */}
        <svg className="lanyard-svg" width="28" height="76" viewBox="0 0 28 76" fill="none">
          <defs>
            <linearGradient id="sl" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#1c1f26"/>
              <stop offset="35%"  stopColor="#4a5568"/>
              <stop offset="65%"  stopColor="#718096"/>
              <stop offset="100%" stopColor="#2d3748"/>
            </linearGradient>
            <linearGradient id="sr" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#2d3748"/>
              <stop offset="35%"  stopColor="#718096"/>
              <stop offset="65%"  stopColor="#4a5568"/>
              <stop offset="100%" stopColor="#1c1f26"/>
            </linearGradient>
          </defs>
          {/* left strand — fans out slightly then back */}
          <path d="M 13 2 C 10 22 6 46 7 75"  stroke="url(#sl)" strokeWidth="4.5" strokeLinecap="round"/>
          <path d="M 13 2 C 10 22 6 46 7 75"  stroke="rgba(255,255,255,0.07)" strokeWidth="1.8" strokeLinecap="round"/>
          {/* right strand */}
          <path d="M 15 2 C 18 22 22 46 21 75" stroke="url(#sr)" strokeWidth="4.5" strokeLinecap="round"/>
          <path d="M 15 2 C 18 22 22 46 21 75" stroke="rgba(255,255,255,0.07)" strokeWidth="1.8" strokeLinecap="round"/>
          {/* subtle cross-weave lines */}
          {[16, 30, 44, 58].map(y => (
            <line key={y} x1="6" y1={y} x2="22" y2={y+2}
              stroke="rgba(0,0,0,0.18)" strokeWidth="0.8"/>
          ))}
        </svg>

        <div className="card-wrapper">
          {/* Metal eyelet grommet — outside .id-card so overflow:hidden doesn't clip it */}
          <div className="card-hole" />

          <div className="id-card">
            {/* Full-width photo — 2/3 of card height */}
            <div className="card-photo-area">
              <img src={profilePic} alt="Pavan Kumar" className="card-photo-img" />
              {/* Purple text overlay at top of photo */}
              <div className="card-photo-overlay">
                <div className="card-name">Bongu Pavan</div>
                <div className="card-role">Tech Enthusiast</div>
              </div>
            </div>

            <div className="card-barcode">
              {BAR_HEIGHTS.map((h, i) => (
                <div key={i} className="bar" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const DV = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons'

const SKILLS = [
  { name: 'React',      icon: `${DV}/react/react-original.svg` },
  { name: 'Node.js',    icon: `${DV}/nodejs/nodejs-original.svg` },
  { name: 'JavaScript', icon: `${DV}/javascript/javascript-original.svg` },
  { name: 'Python',     icon: `${DV}/python/python-original.svg` },
  { name: 'PostgreSQL', icon: `${DV}/postgresql/postgresql-original.svg` },
  { name: 'MongoDB',    icon: `${DV}/mongodb/mongodb-original.svg` },
  { name: 'Docker',     icon: `${DV}/docker/docker-original.svg` },
  { name: 'Kafka',      icon: `${DV}/apachekafka/apachekafka-original.svg` },
  { name: 'Redis',      icon: `${DV}/redis/redis-original.svg` },
  { name: 'IBM ACE',    icon: `${DV}/ibm/ibm-original.svg` },
  { name: 'IBM MQ',     icon: `${DV}/ibm/ibm-original.svg` },
  { name: 'ESQL',       icon: `${DV}/ibm/ibm-original.svg` },
  { name: 'Figma',      icon: `${DV}/figma/figma-original.svg` },
]

const PROJECTS = [
  {
    title: 'E commerce Website',
    desc: 'Full-stack web application for online shopping with user friendly interface and design.',
    tech: ['React', 'Node.js', 'MongoDB'],
  },
  {
    title: 'Tic Tac Toe Game',
    desc: 'Interactive web application for playing the classic Tic Tac Toe game.',
    tech: ['JavaScript', 'HTML', 'CSS'],
  },
  {
    title: 'Gamify super fun',
    desc: 'A web application that turns daily tasks into a fun and engaging game, boosting productivity and motivation.',
    tech: ['React', 'Javascript', 'Stripe', 'Node.js','PostgreSQL', 'Redis', 'Docker', 'Web socket'],
  },
]

export default function App() {
  return (
    <div className="app">

      {/* ── Navbar ── */}
      <nav className="nav">
        <span className="nav-brand">PK.</span>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      {/* ── Hero ── */}
      <section className="hero" id="home">
        <div className="hero-text">
          <p className="greeting">Hello, I'm</p>
          <h1 className="hero-name">Bongu Pavan</h1>
          <h2 className="hero-title">Full Stack, UI/UX and Integration Developer</h2>
          <p className="hero-desc">
            I craft engaging, high-performance web applications
            with a passion for clean code and beautiful user experiences.
          </p>
          <div className="hero-cta">
            <a href="#projects" className="btn-primary">View My Work</a>
            <a href="#contact" className="btn-outline">Get In Touch</a>
          </div>
        </div>

        <div className="hero-card-area">
          <IDCard />
        </div>

        {/* decorative glow blobs */}
        <div className="glow-blob glow-1" />
        <div className="glow-blob glow-2" />
      </section>

      {/* ── About ── */}
      <section className="section" id="about">
        <div className="section-inner">
          <h2 className="section-title">About Me</h2>
          <p className="section-text">
            I'm a passionate developer who loves building things for the web.
            With a strong foundation in both frontend and backend technologies,
            I turn complex problems into simple, intuitive digital experiences
            — from initial concept all the way to production deployment.
          </p>
        </div>
      </section>

      {/* ── Skills ── */}
      <section className="section section-dark" id="skills">
        <div className="section-inner">
          <h2 className="section-title">Skills</h2>
          <div className="skills-grid">
            {SKILLS.map(s => (
              <div key={s.name} className="skill-tag">
                <img src={s.icon} alt={s.name} className="skill-icon" />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Projects ── */}
      <section className="section" id="projects">
        <div className="section-inner">
          <h2 className="section-title">Projects</h2>
          <div className="projects-grid">
            {PROJECTS.map(p => (
              <div key={p.title} className="project-card">
                <div className="project-thumb" />
                <div className="project-body">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <div className="tech-tags">
                    {p.tech.map(t => <span key={t} className="tech-tag">{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="section section-dark contact-section" id="contact">
        <div className="section-inner">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-text">
            I'm currently open to new opportunities.
            Whether you have a project idea or just want to say hi — my inbox is always open!
          </p>
          <a href="mailto:PavanB11@outlook.com" className="btn-primary">Say Hello</a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <span>© 2025 Pavan Kumar · Built with React &amp; Vite</span>
      </footer>

    </div>
  )
}
