const Notification = require("../../models/notification.model");
const Order = require("../../models/order.model.js");
const Product = require("../../models/product.model.js");
const User = require("../../models/user.model.js");
const asyncHandler = require("../../utils/asyncHandler");

const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const dashboardStats = await Order.aggregate([
    {
      $facet: {
        revenueStats: [
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0] } },
              commissionRevenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, { $ifNull: ["$commission", 0] }, 0] } }
            }
          }
        ],
        monthlyStats: [
          { $match: { createdAt: { $gte: startOfMonth } } },
          {
            $group: {
              _id: null,
              ordersThisMonth: { $sum: 1 },
              revenueThisMonth: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0] } }
            }
          }
        ],
        pendingOrders: [{ $match: { status: "pending" } }, { $count: "count" }],
        topProducts: [
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.productId",
              totalSold: { $sum: "$items.quantity" },
              revenue: { $sum: "$items.subtotal" },
            },
          },
          { $sort: { totalSold: -1 } },
          { $limit: 5 },
        ]
      }
    }
  ]);

  const [
    revenueStats,
    monthlyStats,
    totalOrders,
    totalProducts,
    totalCustomers,
    pendingOrdersData,
    recentOrders,
    topProducts
  ] = await Promise.all([
    Promise.resolve(dashboardStats[0].revenueStats),
    Promise.resolve(dashboardStats[0].monthlyStats),
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Promise.resolve(dashboardStats[0].pendingOrders),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id totalAmount status paymentStatus createdAt userId")
      .populate("userId", "name email")
      .lean(),
    Promise.resolve(dashboardStats[0].topProducts)
  ]);

  const pendingOrders = pendingOrdersData[0]?.count || 0;

  const revData = revenueStats[0] || { totalRevenue: 0, commissionRevenue: 0 };
  const monthData = monthlyStats[0] || { ordersThisMonth: 0, revenueThisMonth: 0 };

  res.json({
    success: true,
    data: {
      totalRevenue: revData.totalRevenue,
      commissionRevenue: revData.commissionRevenue,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalCustomers,
      ordersThisMonth: monthData.ordersThisMonth,
      revenueThisMonth: monthData.revenueThisMonth,
      topProducts,
      recentOrders,
    },
  });
});

const getAllUsersAdmin = asyncHandler(async (req, res) => {
  let { page = 1, limit = 20, search } = req.query;

  page = Number(page);
  limit = Number(limit);

  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  filter.role = "customer";

  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .skip((page - 1) * limit)
    .limit(limit);

  const userIds = users.map(u => u._id);
  const userStats = await Order.aggregate([
    { $match: { userId: { $in: userIds } } },
    {
      $group: {
        _id: "$userId",
        totalOrders: { $sum: 1 },
        totalSpend: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0] } }
      }
    }
  ]);

  const statsMap = {};
  userStats.forEach(stat => {
    statsMap[stat._id] = stat;
  });

  const usersWithStats = users.map(user => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    totalOrders: statsMap[user._id]?.totalOrders || 0,
    totalSpend: statsMap[user._id]?.totalSpend || 0,
  }));

  res.json({
    success: true,
    data: {
      users: usersWithStats,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

module.exports = {
  getDashboardAnalytics,
  getAllUsersAdmin,
};
