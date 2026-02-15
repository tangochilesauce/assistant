import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.todoItem.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.project.deleteMany()
  await prisma.settings.deleteMany()

  // Settings
  await prisma.settings.create({
    data: { id: 'singleton', startingBalance: 45 }
  })

  // ============================================================
  // PROJECTS
  // ============================================================
  const tango = await prisma.project.create({
    data: {
      name: 'Tango', emoji: '🔥', colorHex: '#DD4444',
      weight: 0.65, sortOrder: 0
    }
  })
  const ffeedd = await prisma.project.create({
    data: {
      name: 'FFEEDD', emoji: '📱', colorHex: '#2A9D8F',
      weight: 0.15, sortOrder: 1
    }
  })
  const madder = await prisma.project.create({
    data: {
      name: 'Madder', emoji: '🎸', colorHex: '#7B2CBF',
      weight: 0.05, sortOrder: 2
    }
  })
  const dreamBeds = await prisma.project.create({
    data: {
      name: 'Dream Beds', emoji: '🎬', colorHex: '#E07A00',
      weight: 0.05, sortOrder: 3
    }
  })
  const life = await prisma.project.create({
    data: {
      name: 'Life Admin', emoji: '🏠', colorHex: '#666666',
      weight: 0.0, sortOrder: 4
    }
  })

  // ============================================================
  // GOALS — Yearly → Monthly hierarchy
  // ============================================================

  // TANGO yearly
  const tangoYearly = await prisma.goal.create({
    data: {
      title: '$25K/mo across Amazon + UNFI + Costco + EXP',
      timeframe: 'yearly',
      targetDate: new Date('2027-02-01'),
      projectId: tango.id
    }
  })
  // TANGO monthly
  const tangoMonthly = await prisma.goal.create({
    data: {
      title: 'Ship EXP pallet, 2 UNFI pallets, fix Amazon PPC, DTC blitz',
      timeframe: 'monthly',
      targetDate: new Date('2026-02-28'),
      parentId: tangoYearly.id,
      projectId: tango.id
    }
  })

  // FFEEDD yearly
  const ffeeddYearly = await prisma.goal.create({
    data: {
      title: '$5K/mo from app subscriptions',
      timeframe: 'yearly',
      targetDate: new Date('2027-02-01'),
      projectId: ffeedd.id
    }
  })
  const ffeeddMonthly = await prisma.goal.create({
    data: {
      title: 'Launch at $10, get first 100 users',
      timeframe: 'monthly',
      targetDate: new Date('2026-02-28'),
      parentId: ffeeddYearly.id,
      projectId: ffeedd.id
    }
  })

  // MADDER yearly
  const madderYearly = await prisma.goal.create({
    data: {
      title: 'Release EP, build Spotify presence, play shows',
      timeframe: 'yearly',
      targetDate: new Date('2027-02-01'),
      projectId: madder.id
    }
  })
  const madderMonthly = await prisma.goal.create({
    data: {
      title: 'Drop single Feb 22, start EP recording',
      timeframe: 'monthly',
      targetDate: new Date('2026-02-28'),
      parentId: madderYearly.id,
      projectId: madder.id
    }
  })

  // DREAM BEDS yearly
  const dbYearly = await prisma.goal.create({
    data: {
      title: '100 videos, monetize YouTube',
      timeframe: 'yearly',
      targetDate: new Date('2027-02-01'),
      projectId: dreamBeds.id
    }
  })
  const dbMonthly = await prisma.goal.create({
    data: {
      title: 'Batch 7 videos/week, hit 19 total',
      timeframe: 'monthly',
      targetDate: new Date('2026-02-28'),
      parentId: dbYearly.id,
      projectId: dreamBeds.id
    }
  })

  // ============================================================
  // TRANSACTIONS — Current cash flow reality
  // ============================================================

  // Income
  await prisma.transaction.createMany({
    data: [
      { title: 'Amazon', amount: 561, date: new Date('2026-02-17'), isConfirmed: true, category: 'income', notes: 'Confirmed', projectId: tango.id },
      { title: 'UNFI Moreno Valley', amount: 3422, date: new Date('2026-02-23'), isConfirmed: false, category: 'income', notes: 'PO #044849783', projectId: tango.id },
      { title: 'Amazon', amount: 350, date: new Date('2026-02-28'), isConfirmed: true, category: 'income', notes: 'Confirmed low', projectId: tango.id },
      { title: 'UNFI Hudson Valley', amount: 3422, date: new Date('2026-03-11'), isConfirmed: false, category: 'income', notes: 'PO #1052998', projectId: tango.id },
      { title: 'Amazon', amount: 500, date: new Date('2026-03-14'), isConfirmed: false, category: 'income', projectId: tango.id },
      { title: 'EXP Corp', amount: 3400, date: new Date('2026-03-21'), isConfirmed: false, category: 'income', notes: 'PO #12165 net 30', projectId: tango.id },
      { title: 'Amazon', amount: 500, date: new Date('2026-03-28'), isConfirmed: false, category: 'income', projectId: tango.id },
    ]
  })

  // Expenses
  await prisma.transaction.createMany({
    data: [
      { title: 'Deep (My Orchard)', amount: -1299, date: new Date('2026-02-23'), isConfirmed: true, category: 'supplier', notes: 'Overdue — pay from UNFI MOR', projectId: tango.id },
      { title: 'Foodies (Aria)', amount: -1100, date: new Date('2026-02-23'), isConfirmed: true, category: 'supplier', notes: 'Overdue — pay from UNFI MOR', projectId: tango.id },
      { title: 'Off Record Studio', amount: -300, date: new Date('2026-03-01'), isConfirmed: false, isRecurring: true, recurrenceRule: 'monthly', recurrenceDay: 1, category: 'bill', projectId: madder.id },
      { title: 'Rent', amount: -2878, date: new Date('2026-03-11'), isConfirmed: false, isRecurring: true, recurrenceRule: 'monthly', recurrenceDay: 1, category: 'rent', notes: 'Delayed to Mar 11', projectId: life.id },
      { title: 'Daylight Shipping', amount: -400, date: new Date('2026-03-11'), isConfirmed: false, category: 'shipping', notes: 'EXP pallet', projectId: tango.id },
      { title: 'Deep — new ingredients', amount: -1300, date: new Date('2026-03-21'), isConfirmed: false, category: 'supplier', projectId: tango.id },
      { title: 'Aria — cook + pack', amount: -1000, date: new Date('2026-03-21'), isConfirmed: false, category: 'supplier', projectId: tango.id },
      { title: 'Acorn boxes', amount: -804, date: new Date('2026-03-21'), isConfirmed: false, category: 'supplier', notes: '1,000 logo boxes', projectId: tango.id },
      { title: 'Labels (Mild + Truffle)', amount: -1500, date: new Date('2026-03-21'), isConfirmed: false, category: 'supplier', projectId: tango.id },
      { title: 'Rent', amount: -2878, date: new Date('2026-04-01'), isConfirmed: false, isRecurring: true, recurrenceRule: 'monthly', recurrenceDay: 1, category: 'rent', projectId: life.id },
      { title: 'Off Record Studio', amount: -300, date: new Date('2026-04-01'), isConfirmed: false, isRecurring: true, recurrenceRule: 'monthly', recurrenceDay: 1, category: 'bill', projectId: madder.id },
    ]
  })

  // ============================================================
  // TODO ITEMS — Current two-week schedule
  // ============================================================
  const todos = [
    // SAT Feb 14
    { title: 'Email Daylight re: Thu pickup', date: '2026-02-14', timeSlot: 'pm', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'Finish FFEEDD features + submit to App Store', date: '2026-02-14', timeSlot: 'eve', isLocked: true, projectId: ffeedd.id, goalId: ffeeddMonthly.id },
    { title: 'Record screen capture for TikTok/Reddit', date: '2026-02-14', timeSlot: 'eve', isLocked: false, projectId: ffeedd.id, goalId: ffeeddMonthly.id },
    { title: 'Writing/arranging — single must get DONE', date: '2026-02-14', timeSlot: 'am', isLocked: true, projectId: madder.id, goalId: madderMonthly.id },

    // SUN Feb 15
    { title: 'Make 88 boxes', date: '2026-02-15', timeSlot: 'am', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'Swap Mild caps (180)', date: '2026-02-15', timeSlot: 'am', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'Renew S&S coupons', date: '2026-02-15', timeSlot: 'pm', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'Pause SD-REMARKETING', date: '2026-02-15', timeSlot: 'eve', isLocked: false, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'Boost Sriracha Auto → $25/day', date: '2026-02-15', timeSlot: 'eve', isLocked: false, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'Batch 7 Dream Beds videos (~70 min)', date: '2026-02-15', timeSlot: 'am', isLocked: true, projectId: dreamBeds.id, goalId: dbMonthly.id },

    // MON Feb 16
    { title: 'Kitchen: HVA cap swap + retape (40 boxes)', date: '2026-02-16', timeSlot: 'am', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'Home: Box Hot (300), Mild (180), Sriracha (48)', date: '2026-02-16', timeSlot: 'pm', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'DistroKid upload (track must be done!)', date: '2026-02-16', timeSlot: 'am', isLocked: true, projectId: madder.id, goalId: madderMonthly.id },
    { title: 'Set up Spotify/Apple Music profiles', date: '2026-02-16', timeSlot: 'eve', isLocked: false, projectId: madder.id, goalId: madderMonthly.id },
    { title: 'Create pre-save link', date: '2026-02-16', timeSlot: 'eve', isLocked: false, projectId: madder.id, goalId: madderMonthly.id },

    // TUE Feb 17
    { title: 'Final pallet staging', date: '2026-02-17', timeSlot: 'am', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'Check FFEEDD review status', date: '2026-02-17', timeSlot: 'eve', isLocked: true, projectId: ffeedd.id, goalId: ffeeddMonthly.id },
    { title: 'Prep marketing assets: Reddit post, TikTok caption', date: '2026-02-17', timeSlot: 'eve', isLocked: false, projectId: ffeedd.id, goalId: ffeeddMonthly.id },
    { title: '🎙️ Studio @ Off Record', date: '2026-02-17', timeSlot: 'am', isLocked: false, projectId: madder.id, goalId: madderMonthly.id },

    // WED Feb 18
    { title: 'Foodies: Hand-fill Mango (180) + Truffle (60) — PALLETS DONE', date: '2026-02-18', timeSlot: 'am', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'DTC site fixes: CTA, free shipping banner, Sampler Bundle, NEW badge', date: '2026-02-18', timeSlot: 'pm', isLocked: false, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'Email blast the list', date: '2026-02-18', timeSlot: 'pm', isLocked: false, projectId: tango.id, goalId: tangoMonthly.id },
    { title: '🚀 FFEEDD MARKETING BLITZ (if live)', date: '2026-02-18', timeSlot: 'eve', isLocked: false, projectId: ffeedd.id, goalId: ffeeddMonthly.id },

    // THU Feb 19
    { title: 'EXP pallet pickup (Daylight ~$400)', date: '2026-02-19', timeSlot: 'am', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'Product Hunt launch', date: '2026-02-19', timeSlot: 'eve', isLocked: false, projectId: ffeedd.id, goalId: ffeeddMonthly.id },
    { title: 'Cut 3-5 Shorts from existing Dream Beds videos', date: '2026-02-19', timeSlot: 'pm', isLocked: false, projectId: dreamBeds.id, goalId: dbMonthly.id },

    // FRI Feb 20
    { title: 'Amazon PPC: Seller Support call, audit search terms, kill dead campaigns', date: '2026-02-20', timeSlot: 'pm', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },
    { title: '🎙️ Studio @ Off Record', date: '2026-02-20', timeSlot: 'am', isLocked: false, projectId: madder.id, goalId: madderMonthly.id },

    // SAT Feb 21
    { title: 'Final mix/master', date: '2026-02-21', timeSlot: 'am', isLocked: true, projectId: madder.id, goalId: madderMonthly.id },
    { title: 'Create Canvas loop (3-8 sec)', date: '2026-02-21', timeSlot: 'pm', isLocked: false, projectId: madder.id, goalId: madderMonthly.id },
    { title: 'Finalize artwork', date: '2026-02-21', timeSlot: 'pm', isLocked: false, projectId: madder.id, goalId: madderMonthly.id },

    // SUN Feb 22
    { title: '🎵 SINGLE DROPS', date: '2026-02-22', timeSlot: 'am', isLocked: true, projectId: madder.id, goalId: madderMonthly.id },
    { title: 'DM Sean Momberger, post to all socials', date: '2026-02-22', timeSlot: 'am', isLocked: false, projectId: madder.id, goalId: madderMonthly.id },
    { title: 'Batch 7 Dream Beds videos', date: '2026-02-22', timeSlot: 'pm', isLocked: true, projectId: dreamBeds.id, goalId: dbMonthly.id },

    // MON Feb 23
    { title: 'PAY DEEP $1,299 + FOODIES $1,100', date: '2026-02-23', timeSlot: 'am', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'Hacker News "Show HN" post', date: '2026-02-23', timeSlot: 'pm', isLocked: false, projectId: ffeedd.id, goalId: ffeeddMonthly.id },
    { title: '🎙️ Studio — EP work', date: '2026-02-23', timeSlot: 'am', isLocked: false, projectId: madder.id, goalId: madderMonthly.id },

    // TUE Feb 24
    { title: 'Amazon PPC optimize', date: '2026-02-24', timeSlot: 'pm', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },

    // WED Feb 25
    { title: 'UNFI HVA pickup', date: '2026-02-25', timeSlot: 'am', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'Order cook from Deep (~$1,300 credit)', date: '2026-02-25', timeSlot: 'pm', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },

    // THU Feb 26
    { title: 'Cut more Shorts, cross-post TikTok/Reels, r/CozyPlaces', date: '2026-02-26', timeSlot: 'pm', isLocked: false, projectId: dreamBeds.id, goalId: dbMonthly.id },

    // FRI Feb 27
    { title: 'Ingredients arrive', date: '2026-02-27', timeSlot: 'am', isLocked: true, projectId: tango.id, goalId: tangoMonthly.id },
    { title: 'EP mix/master + DistroKid EP upload', date: '2026-02-27', timeSlot: 'am', isLocked: false, projectId: madder.id, goalId: madderMonthly.id },
  ]

  for (const todo of todos) {
    await prisma.todoItem.create({
      data: {
        title: todo.title,
        date: new Date(todo.date),
        timeSlot: todo.timeSlot,
        isLocked: todo.isLocked,
        projectId: todo.projectId,
        goalId: todo.goalId,
      }
    })
  }

  console.log('🍑 Seeded successfully!')
  console.log(`  ${await prisma.project.count()} projects`)
  console.log(`  ${await prisma.goal.count()} goals`)
  console.log(`  ${await prisma.todoItem.count()} todo items`)
  console.log(`  ${await prisma.transaction.count()} transactions`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
