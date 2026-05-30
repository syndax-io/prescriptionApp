import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { 
  Stethoscope, 
  Users, 
  Bell, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Sun, 
  Moon,
  Check 
} from 'lucide-react'

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme()

  const features = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Digital Prescriptions",
      desc: "Create structured, professional prescriptions with medicine schedules, diagnosis, notes and follow-up plans in seconds."
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Smart Reminders",
      desc: "Patients receive timely WhatsApp and email notifications exactly when doses are due. Dramatically improve adherence."
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Secure & Audited",
      desc: "Role-based access control, encrypted records, complete prescription history and clinical audit trail."
    }
  ]

  const doctorFeatures = [
    "Clean, fast prescription builder with searchable formulary",
    "Patient queue with vitals and quick history access",
    "One-click re-issue and print professional Rx slips",
    "Full digital history with search and export",
    "Secure patient data with role isolation"
  ]

  const patientFeatures = [
    "View all active and past prescriptions in one place",
    "WhatsApp + email dose reminders you can actually trust",
    "One-tap mark medicines as taken with adherence tracking",
    "Daily progress summaries and next-dose countdowns",
    "Profile-controlled notification preferences"
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-teal-500 p-1.5 rounded-lg transition group-hover:scale-105">
              <Stethoscope className="w-5 h-5 text-white dark:text-zinc-950" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tighter text-lg">Vanguard Clinical Desk</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-sm">
            <a href="#features" className="hidden md:block px-4 py-1.5 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#for-doctors" className="hidden md:block px-4 py-1.5 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">For Doctors</a>
            <a href="#for-patients" className="hidden md:block px-4 py-1.5 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">For Patients</a>

            <div className="w-px h-5 bg-slate-200 dark:bg-zinc-700 mx-2" />

            <Link 
              to="/login" 
              className="px-4 py-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white dark:text-zinc-950 font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={toggleTheme}
              className="ml-1 p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[620px] h-[620px] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-mono tracking-[2.5px] mb-6 border border-teal-200/60 dark:border-teal-900/60">
            CLINICAL • SECURE • MODERN
          </div>

          <h1 className="text-6xl sm:text-7xl font-bold tracking-[-2.8px] leading-[0.96] mb-6">
            Prescription workflows.<br />Built for care teams.
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-600 dark:text-zinc-400 mb-10">
            A secure clinical platform for digital prescriptions, intelligent reminders, 
            and real-time adherence tracking between doctors and patients.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white dark:text-zinc-950 font-semibold text-[15px] shadow-xl shadow-teal-500/25 hover:shadow-teal-500/30 transition-all"
            >
              Create Your Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-slate-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 font-semibold text-[15px] transition-colors"
            >
              Sign In to Portal
            </Link>
          </div>
          <p className="text-[10px] tracking-[1px] text-slate-500 dark:text-zinc-500 font-mono mt-5">FREE FOR PRACTITIONERS AND PATIENTS • NO CARD REQUIRED</p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <span className="text-teal-600 dark:text-teal-400 text-xs font-semibold tracking-[3px] uppercase">Built for real clinics</span>
          <h2 className="text-3xl font-semibold tracking-tighter mt-3">Powerful features, beautifully simple</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-800/70 rounded-3xl p-8 transition-all duration-200"
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-6 group-hover:scale-105 transition">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-xl tracking-tight mb-3">{feature.title}</h3>
              <p className="text-[15px] leading-relaxed text-slate-600 dark:text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Doctor & Patient Sections */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Doctors */}
          <div id="for-doctors" className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-9">
            <div className="flex items-center gap-4 mb-7">
              <div className="bg-teal-500 p-3 rounded-2xl">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="uppercase font-mono tracking-[2px] text-xs text-teal-600 dark:text-teal-400">PRACTITIONER PORTAL</div>
                <div className="text-3xl font-semibold tracking-tighter">For Doctors</div>
              </div>
            </div>

            <ul className="space-y-3.5">
              {doctorFeatures.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-[15px]">
                  <Check className="w-5 h-5 text-teal-500 mt-px shrink-0" />
                  <span className="text-slate-700 dark:text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>

            <Link to="/register" className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition">
              Join as a Doctor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Patients */}
          <div id="for-patients" className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-9">
            <div className="flex items-center gap-4 mb-7">
              <div className="bg-emerald-500 p-3 rounded-2xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="uppercase font-mono tracking-[2px] text-xs text-emerald-600 dark:text-emerald-400">PATIENT EXPERIENCE</div>
                <div className="text-3xl font-semibold tracking-tighter">For Patients</div>
              </div>
            </div>

            <ul className="space-y-3.5">
              {patientFeatures.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-[15px]">
                  <Check className="w-5 h-5 text-emerald-500 mt-px shrink-0" />
                  <span className="text-slate-700 dark:text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>

            <Link to="/register" className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition">
              Join as a Patient <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl px-10 py-12 text-center">
          <ShieldCheck className="mx-auto w-9 h-9 text-teal-500 mb-4" />
          <h3 className="text-2xl font-semibold tracking-tight mb-3">Ready to upgrade your prescription workflow?</h3>
          <p className="text-slate-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
            Set up your account in less than a minute. Free for doctors and patients.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-white dark:text-zinc-950 font-semibold rounded-2xl transition shadow-lg shadow-teal-500/20"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between text-xs gap-y-3 text-center md:text-left text-slate-500 dark:text-zinc-500 font-mono tracking-wider">
          <div>© {new Date().getFullYear()} Vanguard Clinical Desk — Secure Clinical Platform</div>
          <div className="text-slate-400 dark:text-zinc-600">Built for modern healthcare teams</div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
