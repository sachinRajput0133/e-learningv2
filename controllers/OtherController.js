import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Stats } from "../models/Stats.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";

export const contact = catchAsyncError(async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return next(new ErrorHandler("Fill All Fields", 400));
  const to = process.env.MY_MAIL;
  const subject = "Contact from E Learning";
  const text = `I am ${name} and my Email is ${email}.\n${message}`;

  await sendEmail(to, subject, text);

  res
    .status(200)
    .json({ success: true, message: "Your Message Has Been Sent" });
});

// course request

export const request = catchAsyncError(async (req, res, next) => {
  const { name, email, course } = req.body;
  if (!name || !email || !course)
    return next(new ErrorHandler("Fill All Fields", 400));
  const to = process.env.MY_MAIL;
  const subject = "Rques for a course on E-Lerning";
  const text = `I am ${name} and my Email is ${email}.\n${course}`;

  await sendEmail(to, subject, text);

  res
    .status(200)
    .json({ success: true, message: "Your Request Has Been Sent" });
});

// Get dashboaard stats

export const getDashboardStats = catchAsyncError(async (req, res, next) => {
  const stats = await Stats.find().sort({ createdAt: "desc" }).limit(12);

  const statsData = [];
  const requiredSize = 12 - stats.length;

  for (let i = 0; i < stats.length; i++) {
    statsData.unshift(stats[i]);
  }
  for (let i = 0; i < requiredSize; i++) {
    statsData.unshift({
      users: 0,
      subscriptions: 0,
      views: 0,
    });
  }

  const usersCount = statsData[11].users;
  const subscriptionsCount = statsData[11].subscriptions;
  const viewsCount = statsData[11].views;

  let userPercentageChange = 0,
    subscriptionsPercentageChange = 0,
    viewsPercentageChange = 0;

  let userProfit = true,
    subscriptionsProfit = true,
    viewsProfit = true;
  // percentage change if previous is zero
  if (statsData[10].users === 0)
    userPercentageChange = statsData[11].users * 100;
  if (statsData[10].subscriptions === 0)
    subscriptionsPercentageChange = statsData[11].subscriptions * 100;
  if (statsData[10].views === 0)
    viewsPercentageChange = statsData[11].views * 100;
  else {
    // percentage change from previopus month
    const difference = {
      user: statsData[11].users - statsData[10].users,
      subscriptions: statsData[11].subscriptions - statsData[10].subscriptions,
      views: statsData[11].views - statsData[10].views,
    };

    userPercentageChange = (difference.user / statsData[10].users) * 100;
    userPercentageChange =
      (difference.subscriptions / statsData[10].subscriptions) * 100;
    userPercentageChange = (difference.views / statsData[10].views) * 100;
    //    decrease in profit from previos month
    if (userPercentageChange < 0) userProfit = false;
    if (subscriptionsPercentageChange < 0) subscriptionsProfit = false;
    if (viewsPercentageChange < 0) viewsProfit = false;
  }

  res.status(200).json({
    success: true,
    usersCount,
    subscriptionsCount,
    viewsCount,
    stats: statsData,
    userProfit,
    subscriptionsProfit,
    viewsProfit,
    userPercentageChange,
    subscriptionsPercentageChange,
    viewsPercentageChange,
  });
});
