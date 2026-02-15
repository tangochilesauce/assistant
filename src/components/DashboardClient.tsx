'use client'

import { useEffect, useState } from 'react'

interface Project {
  id: string
  name: string
  emoji: string
  colorHex: string
  yearlyGoal: string
  monthlyGoal: string
  topActions: string[]
}

interface DayEvent {
  date: string
  dayName: string
  events: { title: string; time: string; isLocked: boolean }[]
}

export function DashboardClient() {
  const [projects, setProjects] = useState<Project[]>([])
  const [days, setDays] = useState<DayEvent[]>([])

  useEffect(() => {
    // TODO: Fetch from API once Notion agent finishes
    // For now, mock data
    setProjects([
      {
        id: '5',
        name: 'Life Admin',
        emoji: '🌟',
        colorHex: '#eab308',
        yearlyGoal: 'Stay on top of non-negotiables',
        monthlyGoal: 'Pay all bills on time, no rent delays',
        topActions: [
          'Delay rent to Mar 11',
          'Pay Off Record $300 (Mar 1)',
          'Amazon PPC monitoring',
          'DNS cleanup (SPF/DKIM)',
          'Brand redesign (1-2 days)',
          'Fix email deliverability',
          'Organize financial statements',
          'Review insurance renewals',
          'Tax prep documents',
          'Chase quarterly payments'
        ]
      },
      {
        id: '1',
        name: 'Tango',
        emoji: '🔥',
        colorHex: '#f97316',
        yearlyGoal: '$25K/month across all Tango channels',
        monthlyGoal: 'Ship EXP pallet ($3.4K), fix Amazon PPC, close DTC sales',
        topActions: [
          'Pay Foodies $1,100 (Feb 23)',
          'EXP pickup (Feb 19)',
          'Pause SD-REMARKETING campaign',
          'Boost Sriracha Auto to $25/day',
          'DTC site fixes + email blast',
          'Renew Truffle + Hot S&S coupons',
          'Fix HOTT2 variation on Amazon',
          'Kill 14 dead $3/day campaigns',
          'Homepage CTA mobile fix',
          'Email blast to DTC list'
        ]
      },
      {
        id: '2',
        name: 'FFEEDD',
        emoji: '🐇',
        colorHex: '#84cc16',
        yearlyGoal: '$5K/month from app subscriptions',
        monthlyGoal: 'Launch app, get first 15 paid downloads ($150)',
        topActions: [
          'Submit to App Store (Feb 14)',
          'Reddit marketing blitz (r/terminal, r/unixporn)',
          'TikTok screen recording post',
          'Product Hunt launch',
          'Text 30 friends',
          'Hacker News "Show HN" post',
          'Screen capture video for socials',
          'Write App Store description',
          'Set up analytics tracking',
          'Prep marketing assets (Reddit post copy)'
        ]
      },
      {
        id: '3',
        name: 'Madder',
        emoji: '💿',
        colorHex: '#3b82f6',
        yearlyGoal: '$5K/month from music production',
        monthlyGoal: 'Drop single 2/22, build pre-save to 50+',
        topActions: [
          'Finish single arrangement (Feb 14)',
          'DistroKid upload (Feb 16)',
          'Studio session at Off Record (Feb 17)',
          'Create Canvas loop + artwork',
          'DM Sean Momberger on release day',
          'Set up Spotify/Apple profiles',
          'Create pre-save link',
          'EP production sessions (Week 2)',
          'Mix/master for 3/3 EP drop',
          'Festival apps (Great Escape, LAUNCH)'
        ]
      },
      {
        id: '4',
        name: 'Dream Beds',
        emoji: '🌙',
        colorHex: '#a855f7',
        yearlyGoal: '$5K/month from YouTube monetization',
        monthlyGoal: 'Upload 28 videos (7/week), hit 100 subs',
        topActions: [
          'Batch 7 videos (Feb 15)',
          'Cut 5 Shorts from existing videos',
          'Cross-post to TikTok + Reels',
          'Post to r/CozyPlaces',
          'Batch 7 videos (Feb 22)',
          'Post stills to r/ImaginaryInteriors',
          'Upload Shorts to YouTube',
          'Test 8-10 hour video format',
          'Thumbnail optimization',
          'Playlist organization'
        ]
      }
    ])

    // Generate next 10 days from Feb 14
    const startDate = new Date('2026-02-14')
    const mockDays: DayEvent[] = []
    for (let i = 0; i < 10; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      // Mock events based on calendar we built
      let events: { title: string; time: string; isLocked: boolean }[] = []

      if (i === 0) { // Feb 14
        events = [
          { title: 'FFEEDD submit', time: 'PM', isLocked: true },
          { title: 'Madder writing', time: 'AM', isLocked: true }
        ]
      } else if (i === 1) { // Feb 15
        events = [
          { title: 'Dream Beds batch', time: 'AM', isLocked: true },
          { title: 'Make boxes', time: 'PM', isLocked: true }
        ]
      } else if (i === 2) { // Feb 16
        events = [
          { title: 'Kitchen (HVA caps)', time: 'AM', isLocked: true },
          { title: 'Boxing', time: 'PM', isLocked: true },
          { title: 'DistroKid upload', time: 'EVE', isLocked: true }
        ]
      } else if (i === 3) { // Feb 17
        events = [
          { title: 'Studio (Off Record)', time: 'AM', isLocked: false },
          { title: 'Pallet staging', time: 'PM', isLocked: true }
        ]
      } else if (i === 4) { // Feb 18
        events = [
          { title: 'Foodies hand-fill', time: 'AM', isLocked: true },
          { title: 'DTC site fixes', time: 'PM', isLocked: false },
          { title: 'FFEEDD blitz', time: 'EVE', isLocked: false }
        ]
      } else if (i === 5) { // Feb 19
        events = [
          { title: 'EXP pickup', time: 'AM', isLocked: true },
          { title: 'Madder mix', time: 'PM', isLocked: false }
        ]
      }

      mockDays.push({ date: dateStr, dayName, events })
    }
    setDays(mockDays)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Projects Grid - 5 columns, equal height */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8" style={{ height: '50vh' }}>
        {projects.map((project) => (
          <div
            key={project.id}
            className="border rounded-lg p-4 flex flex-col overflow-hidden"
            style={{ borderColor: project.colorHex }}
          >
            {/* Project Header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{project.emoji}</span>
              <h2 className="text-lg font-bold" style={{ color: project.colorHex }}>
                {project.name}
              </h2>
            </div>

            {/* 12-month goal */}
            <div className="mb-3">
              <div className="text-xs text-gray-500 uppercase mb-1">12-Month Goal</div>
              <div className="text-sm text-gray-300">{project.yearlyGoal}</div>
            </div>

            {/* 1-month goal */}
            <div className="mb-3">
              <div className="text-xs text-gray-500 uppercase mb-1">This Month</div>
              <div className="text-sm text-gray-300">{project.monthlyGoal}</div>
            </div>

            {/* Top 10 Actions */}
            <div className="flex-1 overflow-y-auto">
              <div className="text-xs text-gray-500 uppercase mb-2">Top 10 Actions</div>
              <ul className="space-y-2">
                {project.topActions.map((action, idx) => (
                  <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                    <span className="text-gray-600">{idx + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Next 10 Days - Horizontal scroll on mobile, grid on desktop */}
      <div>
        <h2 className="text-xl font-bold mb-4">Next 10 Days</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-3 md:grid md:grid-cols-10 md:gap-2" style={{ minWidth: '800px' }}>
            {days.map((day, idx) => (
              <div
                key={idx}
                className="border border-gray-800 rounded-lg p-3 flex-shrink-0"
                style={{ width: '140px', minHeight: '180px' }}
              >
                {/* Day Header */}
                <div className="text-center mb-3">
                  <div className="text-xs text-gray-500">{day.dayName}</div>
                  <div className="text-sm font-bold">{day.date}</div>
                </div>

                {/* Events */}
                <div className="space-y-2">
                  {day.events.map((event, eventIdx) => (
                    <div
                      key={eventIdx}
                      className={`text-xs p-2 rounded ${
                        event.isLocked ? 'bg-gray-900 font-bold' : 'bg-gray-800'
                      }`}
                    >
                      <div className="text-gray-500 text-[10px] mb-1">{event.time}</div>
                      <div>{event.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
