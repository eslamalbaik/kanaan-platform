const Notification = require("../../models/notification.model");
const Order = require("../../models/order.model.js");
const Product = require("../../models/product.model.js");
const User = require("../../models/user.model.js");
const asyncHandler = require("../../utils/asyncHandler");

const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const orders = await Order.find();
  const totalProducts = await Product.countDocuments();
  const totalCustomers = await User.countDocuments({
    role: "customer",
  });

  let totalRevenue = 0;
  let commissionRevenue = 0;

  let ordersThisMonth = 0;
  let revenueThisMonth = 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  orders.forEach((order) => {
    if (order.paymentStatus === "paid") {
      totalRevenue += order.totalAmount;
      commissionRevenue += order.commission || 0;
    }

    if (order.createdAt >= startOfMonth) {
      ordersThisMonth += 1;

      if (order.paymentStatus === "paid") {
        revenueThisMonth += order.totalAmount;
      }
    }
  });

  const pendingOrders = await Order.countDocuments({
    status: "pending",
  });

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "name email");

  const topProducts = await Order.aggregate([
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
  ]);

  res.json({
    success: true,
    data: {
      totalRevenue,
      commissionRevenue,
      totalOrders: orders.length,
      pendingOrders,
      totalProducts,
      totalCustomers,
      ordersThisMonth,
      revenueThisMonth,
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

  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const orders = await Order.find({ userId: user._id });

      let totalSpend = 0;

      orders.forEach((o) => {
        if (o.paymentStatus === "paid") {
          totalSpend += o.totalAmount;
        }
      });

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        totalOrders: orders.length,
        totalSpend,
      };
    }),
  );

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
