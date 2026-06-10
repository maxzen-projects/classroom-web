const cron = require('node-cron');
const LiveClass = require('../models/LiveClass');
let jobStarted = false;

const startLiveClassCron = () => {
     if (jobStarted) return;

  jobStarted = true;
  console.log('🟢 Live Class Status Cron Started');

 cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    console.log("CRON RUNNING:", now.toISOString());
const liveClasses = await LiveClass.find({
  status: { $in: ['scheduled', 'live'] }
});
    for (const cls of liveClasses) {
      const start = new Date(cls.scheduledAt);
      const end = new Date(start.getTime() + cls.duration * 60000);

      let newStatus = 'scheduled';

      if (now >= start && now <= end) {
        newStatus = 'live';
      } else if (now > end) {
        newStatus = 'completed';
      }

      console.log(`Class: ${cls.title}`);
      console.log("NOW:", now);
      console.log("START:", start);
      console.log("END:", end);
      console.log("OLD:", cls.status, "NEW:", newStatus);

      if (cls.status !== newStatus) {
        cls.status = newStatus;
        await cls.save();
        console.log("UPDATED ✅");
      }
    }

  } catch (err) {
    console.error('CRON ERROR:', err.message);
  }
});
};

module.exports = startLiveClassCron;