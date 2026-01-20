import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800">
      {/* Header */}
      <header className="container mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            💊 PrescriptionApp
          </h1>
          <div className="flex gap-4">
            <Link to="/login" className="text-white hover:text-primary-200">
              Login
            </Link>
            <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">
          Never Miss Your Medicines Again
        </h2>
        <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
          A complete prescription management system that connects doctors and patients. 
          Get WhatsApp reminders for your medicines and stay healthy!
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50 text-lg px-8 py-3">
            Register Now
          </Link>
          <Link to="/login" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-700 text-lg px-8 py-3">
            Login
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-white text-center mb-12">
          How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">👨‍⚕️</div>
            <h4 className="text-xl font-bold text-gray-800 mb-3">For Doctors</h4>
            <p className="text-gray-600">
              Create digital prescriptions with medicine schedules. 
              Your patients receive instant email notifications.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">📱</div>
            <h4 className="text-xl font-bold text-gray-800 mb-3">WhatsApp Reminders</h4>
            <p className="text-gray-600">
              Patients receive timely WhatsApp notifications 
              reminding them when to take their medicines.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h4 className="text-xl font-bold text-gray-800 mb-3">Track Progress</h4>
            <p className="text-gray-600">
              Mark medicines as taken and track your health journey. 
              Never miss a dose again!
            </p>
          </div>
        </div>
      </section>

      {/* Doctor & Patient Sections */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur rounded-xl p-8">
            <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🩺</span> Doctor Features
            </h4>
            <ul className="space-y-3 text-primary-100">
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> Create digital prescriptions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> Manage multiple patients
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> Set medicine schedules
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> Automatic email notifications
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> View prescription history
              </li>
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-8">
            <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🏥</span> Patient Features
            </h4>
            <ul className="space-y-3 text-primary-100">
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> View all prescriptions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> WhatsApp medicine reminders
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> Mark medicines as taken
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> Daily health summaries
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span> Email notifications
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 text-center text-primary-200">
        <p>© 2024 PrescriptionApp. All rights reserved.</p>
        <p className="text-sm mt-2">Made with ❤️ for better healthcare</p>
      </footer>
    </div>
  )
}

export default LandingPage
