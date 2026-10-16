// Interface text in English and Simplified Chinese.
// Health guidance wording follows the linked NHS pages; the Chinese is a translation of
// the English text here, not of anything beyond it.
window.Lilac = window.Lilac || {};

Lilac.i18n = (() => {
  const KEY = "lilac.lang";
  const s = (n, one, many) => (n === 1 ? one : many);

  const en = {
    "doc.title": "Lilac · Period tracker",
    "doc.description": "Record your periods, see when the next one is likely, and get guidance sourced from the NHS.",
    "lang.switch": "中文",
    "lang.switchLabel": "切换到中文",
    "skip": "Skip to content",
    "storage.local": "Kept on this device only",
    "storage.synced": "Synced to your account",
    "logToday": "Log today",

    // Appearance
    "theme.title": "Appearance",
    "theme.colour": "Colour theme",
    "theme.lilac": "Lilac", "theme.rose": "Rose", "theme.peach": "Peach", "theme.mint": "Mint", "theme.ocean": "Ocean",
    "theme.mode": "Light or dark",
    "theme.auto": "Match device", "theme.light": "Light", "theme.dark": "Dark",
    "theme.synced": "Saved to your account, so your other devices switch too.",
    "theme.local": "Saved on this device. Sign in to sync it to your other devices.",

    // Home: greeting, check-in, stats, reminder
    "greet.morning": (v) => (v.name ? `Good morning, ${v.name}` : "Good morning"),
    "greet.afternoon": (v) => (v.name ? `Good afternoon, ${v.name}` : "Good afternoon"),
    "greet.evening": (v) => (v.name ? `Good evening, ${v.name}` : "Good evening"),
    "phase.period": "Period",
    "phase.premenstrual": "Pre-period",
    "phase.late": "Late",
    "phase.between": "Cycle day",
    "checkin.title": "How's today?",
    "checkin.sub": "Tap to record today's bleeding.",
    "checkin.more": "Add pain, symptoms and notes",
    "toast.savedToday": "Saved for today",
    "toast.saved": "Saved",
    "stats.label": "Summary",
    "stats.cycle": "Average cycle",
    "stats.period": "Average period",
    "stats.recorded": "Cycles recorded",
    "stats.next": "Next period in",
    "stats.late": "Late",
    "stats.anyDay": "Any day",
    "unit.days": (v) => (v.n === 1 ? "day" : "days"),
    "remind.button": "Add a reminder to my calendar",
    "remind.done": "Open the downloaded file to add it to your calendar",
    "ics.summary": "Lilac: your period may start soon",
    "ics.description": (v) => `Lilac estimates your next period between ${v.from} and ${v.to}.`,

    // Dial and status
    "dial.eyebrow": "cycle day",
    "dial.of": (v) => `of about ${v.n}`,
    "dial.empty": "no periods yet",
    "dial.emptySub": "log one to begin",
    "dial.label": (v) => `Cycle day ${v.day} of about ${v.n}. Estimated next period ${v.from} to ${v.to}.`,
    "dial.labelEmpty": "No periods recorded yet.",
    "status.welcome": "Welcome",
    "status.welcomeHeadline": "When did your last period start?",
    "status.welcomeLede": "Record it and Lilac will estimate your next one.",
    "status.chooseStart": "Choose the start day",
    "status.basisHistory": (v) => `Based on your last ${v.n} ${s(v.n, "cycle", "cycles")}, averaging ${v.avg} days.`,
    "status.basisDefault": "Based on a typical 28-day cycle until you record a second period.",
    "status.period": "On your period",
    "status.periodHeadline": (v) => `Day ${v.n} of bleeding`,
    "status.periodLede": (v) => `Your periods usually last about ${v.n} days. Next one likely ${v.range}.`,
    "status.late": "Later than estimated",
    "status.lateHeadline": (v) => `${v.n} ${s(v.n, "day", "days")} past the window`,
    "status.lateLede": (v) => `The estimate was ${v.range}. If it has started, select the day on the calendar.`,
    "status.next": "Next period likely",
    "status.anyDay": "Next period could start any day",
    "status.inDays": (v) => `In about ${v.n} ${s(v.n, "day", "days")}. ${v.basis}`,

    // Calendar
    "cal.heading": "Calendar",
    "cal.prev": "Previous month",
    "cal.next": "Next month",
    "cal.bleeding": (v) => `${v.flow} bleeding`,
    "cal.estimated": "estimated period",
    "cal.today": "today",
    "legend.period": "Period",
    "legend.estimated": "Estimated",
    "legend.spotting": "Spotting",
    "legend.today": "Today",
    "cal.hint": "Select a day to record flow, pain and symptoms.",

    // Guidance shell
    "guide.heading": "For you right now",
    "guide.flag": "Worth checking with a doctor",
    "guide.source": (v) => `Source: ${v.label}`,

    // History
    "history.heading": "Your cycles",
    "history.key": "Shaded band: 21–35 days, the range the NHS describes as regular",
    "history.days": (v) => `${v.n} days`,
    "history.period": (v) => `${v.n}-day period`,
    "history.waiting": "Your first full cycle will appear here when your next period starts.",
    "history.empty": "Cycles appear here once you've recorded two periods.",

    // Footer
    "foot.disclaimer": "Lilac gives general information from the NHS and published research. It can't diagnose anything, and its estimates must not be used as contraception. If something feels wrong, speak to a doctor.",
    "foot.export": "Export data",
    "foot.import": "Import data",
    "foot.wipe": "Delete all data",

    // Day dialog
    "day.close": "Close",
    "day.bleeding": "Bleeding",
    "flow.none": "None", "flow.spotting": "Spotting", "flow.light": "Light", "flow.medium": "Medium", "flow.heavy": "Heavy",
    "day.pain": "Pain",
    "pain.none": "None", "pain.mild": "Mild", "pain.moderate": "Moderate", "pain.severe": "Severe",
    "day.signs": "Signs worth noting",
    "sign.clots": "Clots larger than about 2.5 cm",
    "sign.soaked": "Changed pad or tampon every 1–2 hours",
    "sign.leaked": "Bled through to clothes or bedding",
    "sign.painkillers": "Painkillers didn't help the pain",
    "day.symptoms": "Other symptoms",
    "sym.headache": "Headache", "sym.bloating": "Bloating", "sym.breast": "Breast tenderness",
    "sym.lowMood": "Low mood", "sym.irritability": "Irritability", "sym.tiredness": "Tiredness", "sym.spots": "Spots",
    "day.notes": "Notes",
    "day.clear": "Clear this day",
    "day.save": "Save day",

    // Alerts
    "alert.saveFailed": "This browser isn't letting Lilac save. Your entry will be lost when you close the page. Check that site data is allowed for this page.",
    "confirm.import": "Importing replaces everything currently recorded in Lilac. Continue?",
    "alert.importFailed": "Couldn't import that file. It doesn't contain Lilac data.",
    "confirm.wipeSynced": "Delete every day you've recorded, on this device and every synced device? This can't be undone. Export your data first if you want a copy.",
    "confirm.wipe": "Delete every day you've recorded? This can't be undone. Export your data first if you want a copy.",

    // Guidance content (sources: NHS pages and Bull et al. 2019, linked in the app)
    "g.welcome.t": "Start with your most recent period",
    "g.welcome.b": "Select the day it started on the calendar and set the bleeding level, then do the same for the following days. Estimates appear once a period is recorded.",
    "g.irregular.one": (v) => `One recent cycle was ${v.n} days`,
    "g.irregular.many": (v) => `${v.n} recent cycles were outside 21–35 days`,
    "g.irregular.b": "The NHS describes periods as irregular when the gap between them is less than 21 days or more than 35 days. See a GP if your periods are irregular or your usual pattern changes. If a gap was long because days weren't logged, you can ignore this.",
    "g.long.t": (v) => `A period lasted ${v.n} days`,
    "g.long.b": "The NHS says to see a GP if your periods last longer than 7 days.",
    "g.heavy.t": "You've logged signs of heavy bleeding",
    "g.heavy.b": "Signs the NHS lists include changing your pad or tampon every 1 to 2 hours, passing clots larger than about 2.5 cm, bleeding through to clothes or bedding, and feeling tired or short of breath a lot. See a GP if heavy periods are affecting your life or you've had them for some time.",
    "g.painUrgent.t": "Severe pain that painkillers didn't help",
    "g.painUrgent.b": "The NHS advises asking for an urgent GP appointment, or contacting NHS 111 (or your local equivalent), if period pain is severe or worse than usual and painkillers have not helped.",
    "g.pain.t": "You've logged severe pain",
    "g.pain.b": "See a GP if period pain stops you doing your usual activities or your periods become more painful. If pain is severe or worse than usual and painkillers don't help, the NHS advises an urgent GP appointment.",
    "g.between.t": "Bleeding between periods",
    "g.between.b": "You logged spotting away from your period. The NHS says bleeding between periods or after sex needs to be checked by a doctor.",
    "g.missed3.t": "No period for about three cycles",
    "g.missed3.b": "The NHS advises seeing a GP if you've missed your period 3 times in a row. If you could be pregnant, take a pregnancy test first.",
    "g.late.t": (v) => `Your period is ${v.n} ${s(v.n, "day", "days")} past the estimate`,
    "g.late.b": "Common causes the NHS lists include pregnancy, stress, rapid weight loss, overdoing exercise, some hormonal contraception and the start of menopause. If you could be pregnant, a pregnancy test is the quickest way to find out. If you simply haven't logged it yet, select the day it started.",
    "g.easePain.t": "Easing period pain",
    "g.easePain.b": "Things the NHS suggests: a warm bath or shower, a heat pad or hot water bottle wrapped in a towel on your tummy, gentle exercise such as walking, swimming or yoga, and painkillers like paracetamol or ibuprofen.",
    "g.tss.t": "Using tampons or a cup",
    "g.tss.b": "Follow the pack instructions and don't leave them in longer than needed. Toxic shock syndrome is rare but serious. If you get a high fever or chills, muscle aches, a rash or a flu-like illness, remove the tampon or cup and get medical help straight away, saying you were using one.",
    "g.pms.t": "The week before your period",
    "g.pms.b": "For PMS, the NHS suggests regular exercise, smaller meals every 2 to 3 hours, plenty of sleep, and ways to reduce stress like yoga or meditation. See a GP if symptoms affect your daily life.",
    "g.diary.t": "Your symptom log is useful to a GP",
    "g.diary.b": "The NHS recommends keeping a symptom diary for at least 2 menstrual cycles and taking it to your appointment. Use Export data at the bottom of the page to share it.",
    "g.sharper.t": "Estimates get sharper with more cycles",
    "g.sharper.history": (v) => `This estimate uses ${v.n} ${s(v.n, "cycle", "cycles")}. After 3, the window narrows to match your own variation. Few people run like clockwork: in a study of 612,613 cycles only 13% were exactly 28 days long.`,
    "g.sharper.default": "Until you've recorded two periods, Lilac assumes a 28-day cycle. In a study of 612,613 cycles the average was 29.3 days and only 13% were exactly 28, so your own data will soon do better.",

    // Sync
    "sync.title": "Sync across devices",
    "chip.off": "Sync off", "chip.syncing": "Syncing…", "chip.synced": "Synced", "chip.offline": "Offline", "chip.error": "Sync problem",
    "sync.unconfigured1": "Sync keeps the same data on all your devices. It needs a free Supabase project, which only you control.",
    "sync.unconfigured2": "Once the project is set up, add its URL and anon key to js/config.js and reload this page. The steps are in README.md.",
    "sync.signInIntro": "Sign in to sync your data across devices.",
    "sync.username": "Username",
    "sync.password": "Password",
    "sync.signIn": "Sign in",
    "sync.createLink": "Create an account",
    "sync.createIntro": "Create the account you'll sign in with on every device.",
    "sync.usernameHelp": "3–30 characters: letters, numbers, dots, dashes or underscores.",
    "sync.passwordHelp": "At least 8 characters.",
    "sync.confirm": "Type the password again",
    "sync.create": "Create account",
    "sync.haveAccount": "I already have an account",
    "sync.working": "Working…",
    "sync.signedInAs": (v) => `Signed in as ${v.name}.`,
    "sync.syncingNow": "Syncing now…",
    "sync.lastSynced": (v) => `Last synced ${v.when}.`,
    "sync.ready": "Ready.",
    "sync.justNow": "just now",
    "sync.minAgo": (v) => `${v.n} min ago`,
    "sync.signOut": "Sign out of sync",
    "sync.signOutConfirm": "Sign out of sync on this device? Your data stays on this device, but changes won't sync until you sign in again.",
    "sync.auto": "Syncs automatically while you're signed in.",
    "err.username": "Usernames are 3–30 characters: letters, numbers, dots, dashes or underscores.",
    "err.passwordShort": "Use at least 8 characters for the password.",
    "err.passwordMismatch": "The two passwords don't match.",
    "err.credentials": "That username and password don't match.",
    "err.taken": "That username is already taken.",
    "err.signupDisabled": "New accounts are switched off for this app. Sign in with an existing account.",
    "err.confirmEmail": "Supabase is asking for an email confirmation that can't arrive. In Supabase, turn off \"Confirm email\" (Authentication → Sign In / Providers → Email), then sign in again.",
    "err.weakPassword": "That password is too weak. Try a longer or less common one.",
    "err.tables": "The Lilac table isn't set up yet. Run supabase/setup.sql in your Supabase project.",
    "err.network": "Couldn't reach Supabase. If Lilac hasn't been used for a week, the free project may be paused: restore it from the Supabase dashboard.",
    "err.offline": "You're offline. Changes are saved on this device and will sync when you're back online.",
    "err.library": "Couldn't load the sync library. Check your connection and reload.",
  };

  const zh = {
    "doc.title": "Lilac · 经期记录",
    "doc.description": "记录月经，预测下次月经的时间，并获得来自英国国民保健署（NHS）的健康建议。",
    "lang.switch": "English",
    "lang.switchLabel": "Switch to English",
    "skip": "跳到主要内容",
    "storage.local": "仅保存在此设备上",
    "storage.synced": "已同步到妳的账户",
    "logToday": "记录今天",

    "theme.title": "外观",
    "theme.colour": "颜色主题",
    "theme.lilac": "丁香紫", "theme.rose": "玫瑰", "theme.peach": "蜜桃", "theme.mint": "薄荷", "theme.ocean": "海洋",
    "theme.mode": "浅色或深色",
    "theme.auto": "跟随设备", "theme.light": "浅色", "theme.dark": "深色",
    "theme.synced": "已保存到妳的账户，其他设备也会一起切换。",
    "theme.local": "已保存在此设备上。登录后可同步到妳的其他设备。",

    "greet.morning": (v) => (v.name ? `早上好，${v.name}` : "早上好"),
    "greet.afternoon": (v) => (v.name ? `下午好，${v.name}` : "下午好"),
    "greet.evening": (v) => (v.name ? `晚上好，${v.name}` : "晚上好"),
    "phase.period": "经期",
    "phase.premenstrual": "经前期",
    "phase.late": "推迟",
    "phase.between": "周期天数",
    "checkin.title": "今天感觉如何？",
    "checkin.sub": "轻点记录今天的出血情况。",
    "checkin.more": "添加疼痛、症状和备注",
    "toast.savedToday": "已记录今天",
    "toast.saved": "已保存",
    "stats.label": "概览",
    "stats.cycle": "平均周期",
    "stats.period": "平均经期",
    "stats.recorded": "已记录周期",
    "stats.next": "距下次月经",
    "stats.late": "推迟",
    "stats.anyDay": "随时",
    "unit.days": () => "天",
    "remind.button": "添加到我的日历提醒",
    "remind.done": "打开下载的文件，即可添加到日历",
    "ics.summary": "Lilac：月经可能快来了",
    "ics.description": (v) => `Lilac 预计妳的下次月经在 ${v.from} 至 ${v.to} 之间。`,

    "dial.eyebrow": "周期天数",
    "dial.of": (v) => `共约 ${v.n} 天`,
    "dial.empty": "尚无记录",
    "dial.emptySub": "记录一次即可开始",
    "dial.label": (v) => `周期第 ${v.day} 天，共约 ${v.n} 天。预计下次月经 ${v.from} 至 ${v.to}。`,
    "dial.labelEmpty": "尚未记录任何月经。",
    "status.welcome": "欢迎",
    "status.welcomeHeadline": "妳上一次月经是哪天开始的？",
    "status.welcomeLede": "记录下来，Lilac 就会预测妳的下一次月经。",
    "status.chooseStart": "选择开始日期",
    "status.basisHistory": (v) => `根据妳最近 ${v.n} 个周期，平均 ${v.avg} 天。`,
    "status.basisDefault": "在妳记录第二次月经之前，按常见的 28 天周期估算。",
    "status.period": "经期中",
    "status.periodHeadline": (v) => `经期第 ${v.n} 天`,
    "status.periodLede": (v) => `妳的经期通常持续约 ${v.n} 天。下次可能在 ${v.range}。`,
    "status.late": "比预计晚",
    "status.lateHeadline": (v) => `已超出预计 ${v.n} 天`,
    "status.lateLede": (v) => `预计时间是 ${v.range}。如果已经来了，请在日历上点选那一天。`,
    "status.next": "下次月经可能在",
    "status.anyDay": "下次月经随时可能开始",
    "status.inDays": (v) => `大约 ${v.n} 天后。${v.basis}`,

    "cal.heading": "日历",
    "cal.prev": "上个月",
    "cal.next": "下个月",
    "cal.bleeding": (v) => `出血：${v.flow}`,
    "cal.estimated": "预计经期",
    "cal.today": "今天",
    "legend.period": "经期",
    "legend.estimated": "预计",
    "legend.spotting": "点滴出血",
    "legend.today": "今天",
    "cal.hint": "点选日期，记录出血量、疼痛和症状。",

    "guide.heading": "给妳的建议",
    "guide.flag": "建议咨询医生",
    "guide.source": (v) => `来源（英文）：${v.label}`,

    "history.heading": "妳的周期",
    "history.key": "阴影区间：21–35 天，即 NHS 所说的规律范围",
    "history.days": (v) => `${v.n} 天`,
    "history.period": (v) => `经期 ${v.n} 天`,
    "history.waiting": "下次月经开始后，妳的第一个完整周期会显示在这里。",
    "history.empty": "记录两次月经后，周期会显示在这里。",

    "foot.disclaimer": "Lilac 提供的是来自英国国民保健署（NHS）和已发表研究的一般信息。它不能做任何诊断，预测结果也不能用作避孕。如果感觉不对劲，请咨询医生。",
    "foot.export": "导出数据",
    "foot.import": "导入数据",
    "foot.wipe": "删除所有数据",

    "day.close": "关闭",
    "day.bleeding": "出血",
    "flow.none": "无", "flow.spotting": "点滴出血", "flow.light": "少量", "flow.medium": "中等", "flow.heavy": "大量",
    "day.pain": "疼痛",
    "pain.none": "无", "pain.mild": "轻微", "pain.moderate": "中等", "pain.severe": "严重",
    "day.signs": "值得留意的迹象",
    "sign.clots": "血块大于约 2.5 厘米",
    "sign.soaked": "每 1–2 小时就要换卫生巾或卫生棉条",
    "sign.leaked": "经血渗到衣服或床单上",
    "sign.painkillers": "止痛药没有缓解疼痛",
    "day.symptoms": "其他症状",
    "sym.headache": "头痛", "sym.bloating": "腹胀", "sym.breast": "乳房胀痛",
    "sym.lowMood": "情绪低落", "sym.irritability": "烦躁易怒", "sym.tiredness": "疲倦", "sym.spots": "长痘",
    "day.notes": "备注",
    "day.clear": "清除这一天",
    "day.save": "保存",

    "alert.saveFailed": "此浏览器不允许 Lilac 保存数据。关闭页面后，妳的记录会丢失。请检查是否允许本网站保存数据。",
    "confirm.import": "导入会替换 Lilac 中现有的所有记录。要继续吗？",
    "alert.importFailed": "无法导入该文件，它不包含 Lilac 数据。",
    "confirm.wipeSynced": "要删除妳记录的所有日子吗？此设备和所有已同步的设备上都会删除，且无法恢复。如需保留副本，请先导出数据。",
    "confirm.wipe": "要删除妳记录的所有日子吗？此操作无法恢复。如需保留副本，请先导出数据。",

    "g.welcome.t": "从最近一次月经开始",
    "g.welcome.b": "在日历上点选开始的那一天并设定出血量，接下来几天也照样记录。记录一次月经后就会显示预测。",
    "g.irregular.one": (v) => `最近有一个周期是 ${v.n} 天`,
    "g.irregular.many": (v) => `最近有 ${v.n} 个周期不在 21–35 天之内`,
    "g.irregular.b": "NHS 将月经间隔少于 21 天或超过 35 天视为不规律。如果月经不规律，或平时的规律有变化，请去看医生。如果间隔很长只是因为漏记了，可以忽略这条。",
    "g.long.t": (v) => `有一次经期持续了 ${v.n} 天`,
    "g.long.b": "NHS 建议，如果经期超过 7 天，请去看医生。",
    "g.heavy.t": "妳记录了经血过多的迹象",
    "g.heavy.b": "NHS 列出的迹象包括：每 1 到 2 小时就要换卫生巾或卫生棉条、排出大于约 2.5 厘米的血块、经血渗到衣服或床单上，以及经常感到疲倦或气短。如果经血过多影响到妳的生活，或已经持续一段时间，请去看医生。",
    "g.painUrgent.t": "严重疼痛，止痛药无效",
    "g.painUrgent.b": "NHS 建议：如果经痛严重或比平时更痛，而且止痛药没有帮助，请尽快预约看医生，或联系当地的医疗咨询热线（在英国是 NHS 111）。",
    "g.pain.t": "妳记录了严重疼痛",
    "g.pain.b": "如果经痛影响妳的日常活动，或月经变得比以前更痛，请去看医生。如果疼痛严重或比平时更痛，而止痛药没有帮助，NHS 建议尽快就医。",
    "g.between.t": "两次月经之间出血",
    "g.between.b": "妳在经期以外记录了点滴出血。NHS 指出，两次月经之间或性行为后出血，需要由医生检查。",
    "g.missed3.t": "大约三个周期没有来月经",
    "g.missed3.b": "NHS 建议，如果连续 3 次没来月经，请去看医生。如果有可能怀孕，请先验孕。",
    "g.late.t": (v) => `月经比预计晚了 ${v.n} 天`,
    "g.late.b": "NHS 列出的常见原因包括：怀孕、压力、体重快速下降、运动过度、某些激素避孕方法，以及开始进入更年期。如果妳有可能怀孕，验孕是最快的确认方法。如果只是还没记录，请点选月经开始的那一天。",
    "g.easePain.t": "缓解经痛",
    "g.easePain.b": "NHS 建议的方法：洗个热水澡；用毛巾包好热敷袋或热水袋，敷在肚子上；做些温和的运动，例如散步、游泳或瑜伽；服用扑热息痛（paracetamol）或布洛芬（ibuprofen）等止痛药。",
    "g.tss.t": "使用卫生棉条或月经杯",
    "g.tss.b": "请按照包装说明使用，不要放置超过需要的时间。中毒性休克综合征很少见，但很严重。如果出现高烧或发冷、肌肉酸痛、皮疹或类似流感的症状，请取出卫生棉条或月经杯并立即就医，并告诉医生妳在使用它。",
    "g.pms.t": "经前一周",
    "g.pms.b": "对于经前综合征（PMS），NHS 建议：规律运动、每 2 到 3 小时吃一顿小餐、充足睡眠，以及通过瑜伽或冥想等方式减压。如果症状影响日常生活，请去看医生。",
    "g.diary.t": "妳的症状记录对医生很有用",
    "g.diary.b": "NHS 建议记录至少 2 个月经周期的症状日记，并在看诊时带上。可用页面底部的“导出数据”来分享。",
    "g.sharper.t": "记录越多，预测越准",
    "g.sharper.history": (v) => `这次预测用了 ${v.n} 个周期。记录满 3 个周期后，预测范围会按妳自己的变化幅度收窄。很少有人像时钟一样准：一项涵盖 612,613 个周期的研究中，只有 13% 恰好是 28 天。`,
    "g.sharper.default": "在妳记录两次月经之前，Lilac 先假设周期为 28 天。一项涵盖 612,613 个周期的研究中，平均周期为 29.3 天，只有 13% 恰好是 28 天，所以妳自己的数据很快就会更准。",

    "sync.title": "多设备同步",
    "chip.off": "未同步", "chip.syncing": "同步中…", "chip.synced": "已同步", "chip.offline": "离线", "chip.error": "同步出错",
    "sync.unconfigured1": "同步功能可让妳在所有设备上使用同一份数据。它需要一个只有妳能管理的免费 Supabase 项目。",
    "sync.unconfigured2": "项目建好后，把它的 URL 和 anon key 填入 js/config.js，再重新加载此页面。步骤见 README.md。",
    "sync.signInIntro": "登录后即可在多台设备间同步数据。",
    "sync.username": "用户名",
    "sync.password": "密码",
    "sync.signIn": "登录",
    "sync.createLink": "创建账户",
    "sync.createIntro": "创建一个账户，用于在每台设备上登录。",
    "sync.usernameHelp": "3–30 个字符：英文字母、数字、点、短横线或下划线。",
    "sync.passwordHelp": "至少 8 个字符。",
    "sync.confirm": "再输入一次密码",
    "sync.create": "创建账户",
    "sync.haveAccount": "我已经有账户",
    "sync.working": "处理中…",
    "sync.signedInAs": (v) => `已登录：${v.name}。`,
    "sync.syncingNow": "正在同步…",
    "sync.lastSynced": (v) => `上次同步：${v.when}。`,
    "sync.ready": "已就绪。",
    "sync.justNow": "刚刚",
    "sync.minAgo": (v) => `${v.n} 分钟前`,
    "sync.signOut": "退出同步",
    "sync.signOutConfirm": "要在此设备上退出同步吗？数据会保留在此设备上，但在妳重新登录前不会同步更改。",
    "sync.auto": "登录后会自动同步。",
    "err.username": "用户名须为 3–30 个字符，只能包含英文字母、数字、点、短横线或下划线。",
    "err.passwordShort": "密码至少需要 8 个字符。",
    "err.passwordMismatch": "两次输入的密码不一致。",
    "err.credentials": "用户名或密码不正确。",
    "err.taken": "该用户名已被使用。",
    "err.signupDisabled": "此应用已关闭新账户注册，请用已有账户登录。",
    "err.confirmEmail": "Supabase 要求确认邮件，但这封邮件无法送达。请在 Supabase 中关闭“Confirm email”（Authentication → Sign In / Providers → Email），然后重新登录。",
    "err.weakPassword": "密码太弱，请换一个更长或更不常见的密码。",
    "err.tables": "Lilac 的数据表还没建立。请在 Supabase 项目中运行 supabase/setup.sql。",
    "err.network": "无法连接 Supabase。如果 Lilac 已一周没用，免费项目可能已暂停，请在 Supabase 控制台中恢复。",
    "err.offline": "妳目前离线。更改已保存在此设备上，恢复联网后会自动同步。",
    "err.library": "无法加载同步组件。请检查网络后重新加载。",
  };

  const dict = { en, zh };
  const listeners = [];

  function pick() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "en" || saved === "zh") return saved;
    } catch (e) { /* storage blocked */ }
    return (navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  let lang = pick();

  function t(key, vars = {}) {
    const v = dict[lang][key] ?? en[key];
    if (v == null) return key;
    return typeof v === "function" ? v(vars) : v;
  }

  // Static text in the page is marked with data-i18n (text) and data-i18n-aria (aria-label).
  function apply() {
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
    document.title = t("doc.title");
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("doc.description"));
    document.querySelectorAll("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll("[data-i18n-aria]").forEach((n) => { n.setAttribute("aria-label", t(n.dataset.i18nAria)); });
  }

  function setLang(next) {
    lang = next;
    try { localStorage.setItem(KEY, next); } catch (e) { /* not remembered */ }
    apply();
    listeners.forEach((fn) => fn());
  }

  return {
    t, apply, setLang,
    lang: () => lang,
    locale: () => (lang === "zh" ? "zh-CN" : "en-GB"),
    onChange: (fn) => listeners.push(fn),
  };
})();
