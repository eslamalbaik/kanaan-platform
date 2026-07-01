const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors({
  origin: "http://localhost:3001",
  credentials: true,
}));

const paymentRoutes = require("./routes/payment.js");
app.use("/v1/payments", paymentRoutes);

require("./db/mongoose");
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const authRoutes = require("./routes/auth.js");
app.use("/v1/auth", authRoutes);

const userRoutes = require("./routes/users.js");
app.use("/v1/users", userRoutes);

const productRoutes = require("./routes/products.js");
app.use("/v1/products", productRoutes);

const categoryRoutes = require("./routes/categories.js");
app.use("/v1/categories", categoryRoutes);

const cartRoutes = require("./routes/cart.js");
app.use("/v1/cart", cartRoutes);

const orderRoutes = require("./routes/orders.js");
app.use("/v1/orders", orderRoutes);

const favoriteRoutes = require("./routes/favorite");
app.use("/v1/favorites", favoriteRoutes);

const notificationRoutes = require("./routes/notification");
app.use("/v1/notifications", notificationRoutes);

const customizationRoutes = require("./routes/customization");
app.use("/v1/customizations", customizationRoutes);

const chatAIRoutes = require("./routes/chatAI");
app.use("/v1/chatAI", chatAIRoutes);

const adminProductRoutes = require("./routes/admin/products");
app.use("/v1/admin/products", adminProductRoutes);

const adminCategoriesRoutes = require("./routes/admin/categories");
app.use("/v1/admin/categories", adminCategoriesRoutes);

const adminCategoriesAttributesRoutes = require("./routes/admin/categoryAttributes");
app.use("/v1/admin/categoryAttribute", adminCategoriesAttributesRoutes);

const couponRoutes = require("./routes/coupon.js");
app.use("/v1/coupons", couponRoutes);

const adminCouponRoutes = require("./routes/admin/coupon.js");
app.use("/v1/admin/coupon", adminCouponRoutes);

const adminOrderRoutes = require("./routes/admin/order.js");
app.use("/v1/admin/orders", adminOrderRoutes);

const adminDashboardRoutes = require("./routes/admin/dashboard.js");
app.use("/v1/admin/dashboard", adminDashboardRoutes);

const adminNotificationRoutes = require("./routes/admin/notifications.js");
app.use("/v1/admin/notifications", adminNotificationRoutes);

const uploadRoutes = require("./routes/upload.js");
app.use("/v1/upload", uploadRoutes);

const notFound = require("./middleware/notFound.js");
const errorHandler = require("./middleware/errorHandler.js");

app.use(notFound);
app.use(errorHandler);

module.exports = app;
