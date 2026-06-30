process.chdir('./Backend');
const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/product.model.js");

async function checkProducts() {
  try {
    await mongoose.connect(process.env.DATABAZE_URL);
    console.log("✅ Connected to MongoDB");

    const total = await Product.countDocuments();
    console.log(`\n📊 Total products in DB: ${total}`);

    const active = await Product.countDocuments({ isActive: true });
    console.log(`✅ Active products: ${active}`);

    const inactive = await Product.countDocuments({ isActive: false });
    console.log(`❌ Inactive products: ${inactive}`);

    const products = await Product.find({ isActive: true }).limit(5);
    console.log(`\n📋 First 5 active products:`);
    products.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (${p._id})`);
    });

    if (products.length === 0) {
      console.log("\n⚠️ NO ACTIVE PRODUCTS FOUND!");
      console.log("\nSample inactive products:");
      const inactiveProducts = await Product.find({ isActive: false }).limit(3);
      inactiveProducts.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} - isActive: ${p.isActive}`);
      });
    }

    await mongoose.connection.close();
    console.log("\n✅ Database check complete");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkProducts();
