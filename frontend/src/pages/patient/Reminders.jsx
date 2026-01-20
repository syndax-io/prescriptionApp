import { useState, useEffect } from 'react'
import api from '../../services/api'
import { format, isToday, isPast } from 'date-fns'
import toast from 'react-hot-toast'

const PatientReminders = () => {
  const [todayReminders, setTodayReminders] = useState([])
  const [upcomingReminders, setUpcomingReminders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const [todayRes, upcomingRes] = await Promise.all([
        api.get('/patient/reminders/today'),
        api.get('/patient/reminders/upcoming')
      ])
      setTodayReminders(todayRes.data.reminders)
      setUpcomingReminders(upcomingRes.data.reminders)
    } catch (error) {
      console.error('Failed to fetch reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeReminder = async (reminderId) => {
    try {
      await api.post(`/patient/reminders/${reminderId}/acknowledge`)
      toast.success('Medicine marked as taken! 💊')
      fetchReminders()
    } catch (error) {
      toast.error('Failed to mark medicine as taken')
    }
  }

  const getReminderStatus = (reminder) => {
    const time = new Date(reminder.scheduled_time)
    if (reminder.acknowledged) return 'taken'
    if (isPast(time)) return 'missed'
    return 'upcoming'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const takenCount = todayReminders.filter(r => r.acknowledged).length
  const totalCount = todayReminders.length
  const progressPercentage = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Medicine Reminders</h1>

      {/* Today's Progress */}
      <div className="card mb-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-100">Today's Progress</p>
            <p className="text-3xl font-bold">{takenCount} of {totalCount} medicines taken</p>
          </div>
          <div className="text-6xl opacity-80">
            {progressPercentage === 100 ? '🎉' : progressPercentage >= 50 ? '💪' : '💊'}
          </div>
        </div>
        <div className="bg-white/20 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        {progressPercentage === 100 && (
          <p className="mt-3 text-primary-100">Excellent! You've taken all your medicines today! 🌟</p>
        )}
      </div>

      {/* Today's Reminders */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📅 Today's Schedule</h2>
        
        {todayReminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">🎉</p>
            <p>No medicines scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayReminders.map((reminder) => {
              const status = getReminderStatus(reminder)
              const time = new Date(reminder.scheduled_time)
              
              return (
                <div 
                  key={reminder.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    status === 'taken' 
                      ? 'bg-green-50 border-green-200'
                      : status === 'missed'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                        status === 'taken' 
                          ? 'bg-green-200 text-green-700'
                          : status === 'missed'
                          ? 'bg-red-200 text-red-700'
                          : 'bg-primary-100 text-primary-700'
                      }`}>
                        {status === 'taken' ? '✅' : status === 'missed' ? '❌' : '💊'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{reminder.medicine_name}</h3>
                        <p className="text-sm text-gray-600">{reminder.dosage}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">
                            ⏰ {format(time, 'h:mm a')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            reminder.before_meal 
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {reminder.before_meal ? 'Before meal' : 'After meal'}
                          </span>
                        </div>
                        {reminder.instructions && (
                          <p className="text-sm text-gray-500 mt-1">{reminder.instructions}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {status === 'taken' ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <span>✓</span> Taken
                          {reminder.acknowledged_at && (
                            <span className="text-xs text-green-500 ml-2">
                              at {format(new Date(reminder.acknowledged_at), 'h:mm a')}
                            </span>
                          )}
                        </span>
                      ) : status === 'missed' ? (
                        <button
                          onClick={() => acknowledgeReminder(reminder.id)}
                          className="btn bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Mark as Taken
                        </button>
                      ) : (
                        <button
                          onClick={() => acknowledgeReminder(reminder.id)}
                          className="btn btn-success"
                        >
                          ✓ Take Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">⏳ Upcoming Reminders</h2>
          <div className="space-y-3">
            {upcomingReminders.filter(r => !isToday(new Date(r.scheduled_time))).slice(0, 5).map((reminder) => {
              const time = new Date(reminder.scheduled_time)
              
              return (
                <div 
                  key={reminder.id}
                  className="p-4 rounded-lg border bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        💊
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{reminder.medicine_name}</h3>
                        <p className="text-sm text-gray-500">{reminder.dosage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-700">{format(time, 'MMM d')}</p>
                      <p className="text-sm text-gray-500">{format(time, 'h:mm a')}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-700 text-sm">
          <span className="font-medium">📱 WhatsApp Reminders:</span> You'll receive 
          WhatsApp notifications when it's time to take your medicines. Make sure your 
          WhatsApp number is updated in your profile.
        </p>
      </div>
    </div>
  )
}

export default PatientReminders
