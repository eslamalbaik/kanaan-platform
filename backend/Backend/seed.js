require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect(process.env.DATABAZE_URL).then(async () => {
  console.log('✅ Connected to DB');

  const User = require('./models/user.model.js');
  const Category = require('./models/category.model.js');
  const Product = require('./models/product.model.js');

  // Reset admin password
  const hash = await bcrypt.hash('Admin1234', 10);
  await User.updateOne({ email: 'admin@kanaan.com' }, { password: hash });
  console.log('✅ Admin password reset to: Admin1234');

  const admin = await User.findOne({ email: 'admin@kanaan.com' });

  // Clear old data
  await Category.deleteMany({});
  await Product.deleteMany({});
  console.log('🗑️ Cleared old categories & products');

  // Create categories
  const cats = await Category.insertMany([
    { name: 'ملابس', slug: 'clothes', description: 'الأثواب والملابس التراثية الفلسطينية', icon: 'Shirt', isActive: true },
    { name: 'منتجات غذائية', slug: 'food-products', description: 'زيت الزيتون والعسل والمنتجات الغذائية المحلية', icon: 'Package', isActive: true },
    { name: 'حرف يدوية', slug: 'handicrafts', description: 'منتجات وأعمال يدوية مصنوعة محلياً', icon: 'Hammer', isActive: true },
    { name: 'اكسسوارات', slug: 'accessories', description: 'إكسسوارات ومنتجات تراثية متنوعة', icon: 'Gem', isActive: true },
  ]);

  const [clothes, food, crafts, accessories] = cats;
  console.log('✅ Created', cats.length, 'categories');

  // Create products
  const products = await Product.insertMany([
    {
      name: 'ثوب مجدلاوي مطرز يدوياً كلاسيك',
      slug: 'thobe-majalawi-classic',
      description: 'تطريز فلسطيني تراثي أصيل مصنوع بدقة وعناية بأيدي نساء محليات.',
      price: 35000,
      stockQuantity: 5,
      category: clothes._id,
      images: ['/assets/storyphoto1.png'],
      attributes: { 'النوع': 'ملابس', 'الطول': ['طويل'], 'المقاس': ['صغير', 'متوسط', 'كبير'], 'اللون': ['أبيض', 'احمر قاتي'], 'الخامة': 'قماش مطرز' },
      isActive: true, isFeatured: true,
    },
    {
      name: 'ثوب مجدلاوي مطرز يدوياً عصري',
      slug: 'thobe-majalawi-modern',
      description: 'تصميم مدمج يجمع الأصالة التراثية بلمسات وتفاصيل تلائم المناسبات الحديثة.',
      price: 32000,
      stockQuantity: 2,
      category: clothes._id,
      images: ['/assets/t-m-thobe.png'],
      attributes: { 'النوع': 'ملابس', 'الطول': ['طويل'], 'المقاس': ['S', 'M', 'L'], 'اللون': ['أسود ملكي', 'تطريز نيلي'], 'الخامة': 'حرير كريب ومطرز' },
      isActive: true, isFeatured: true,
    },
    {
      name: 'زيت زيتون بكر ممتاز - عصرة أولى',
      slug: 'olive-oil-extra-virgin',
      description: 'زيت زيتون فلسطيني نقي من خيرات الأرض، معصور على البارد لحفظ النكهة والجودة.',
      price: 12000,
      stockQuantity: 30,
      category: food._id,
      images: ['/assets/p-ol-oil.png'],
      attributes: { 'الوزن': ['1 لتر', '4 لتر'], 'نوع التعبئة': 'عبوة زجاجية', 'فترة الصلاحية': 'سنتين' },
      isActive: true, isFeatured: true,
    },
    {
      name: 'زيت زيتون بكر ممتاز - سعة أصغر',
      slug: 'olive-oil-small',
      description: 'قطفة أولى وعصرة تقليدية، معبأ بعبوات أصغر تناسب الاستخدام الخفيف.',
      price: 8500,
      stockQuantity: 20,
      category: food._id,
      images: ['/assets/p-ol-oil.png'],
      attributes: { 'الوزن': ['500 مل'], 'نوع التعبئة': 'عبوة زجاجية' },
      isActive: true,
    },
    {
      name: 'صابون النابلسي الزيتي الطبيعي',
      slug: 'nablus-olive-soap',
      description: 'صابون طبيعي 100% مصنوع من زيت الزيتون الصافي للعناية الفائقة والنظافة اليومية.',
      price: 3000,
      stockQuantity: 40,
      category: food._id,
      images: ['/assets/33.png'],
      attributes: { 'الوزن': ['150 غرام'], 'المكونات': 'زيت زيتون بكر، صودا طبيعية' },
      isActive: true,
    },
    {
      name: 'معمول فلسطيني فاخر بالتمر',
      slug: 'maamoul-dates',
      description: 'معمول هش يذوب في الفم، محشو بأجود أنواع عجوة التمر الفاخرة والبهارات الأصلية.',
      price: 5500,
      stockQuantity: 25,
      category: food._id,
      images: ['/assets/22.png'],
      attributes: { 'الوزن': ['1 كيلو جرام'], 'الحشوة': 'تمر عجوة فاخر' },
      isActive: true,
    },
    {
      name: 'طحينة سمسم صافية تقليدية',
      slug: 'tahini-traditional',
      description: 'طحينة مستخلصة من بذور السمسم المحمصة بدقة وعناية على الطريقة التقليدية السلسة.',
      price: 4000,
      stockQuantity: 12,
      category: food._id,
      images: ['/assets/11.png'],
      attributes: { 'الوزن': ['900 غرام'], 'المكونات': 'سمسم صافي 100%' },
      isActive: true,
    },
    {
      name: 'عسل السدر الفلسطيني الطبيعي',
      slug: 'sidr-honey',
      description: 'عسل سدر طبيعي 100% مستخلص من مناحلنا المحلية، غني بالفوائد والمذاق الأصيل.',
      price: 15000,
      stockQuantity: 8,
      category: food._id,
      images: ['/assets/33.png'],
      attributes: { 'الوزن': ['500 غرام', '1 كيلو جرام'], 'النوع': 'عسل سدر جبلي أصيل' },
      isActive: true, isFeatured: true,
    },
    {
      name: 'صينية قش ملونة مصنوعة يدويًا',
      slug: 'straw-tray-colorful',
      description: 'صينية مصنوعة يدوياً من القش الطبيعي الملون بنقوش تراثية روعة.',
      price: 8500,
      stockQuantity: 3,
      category: crafts._id,
      images: ['/assets/h-st-tray.png'],
      attributes: { 'القطر': ['30 سم', '40 سم'], 'اللون': ['متعدد الألوان'], 'نوع القش': 'قش طبيعي' },
      isActive: true, isFeatured: true,
    },
    {
      name: 'حقيبة تطريز فلسطيني أنيقة',
      slug: 'embroidery-bag',
      description: 'حقيبة يد تجمع بين العصرية والأصالة بنقوش تطريز مميزة متناسقة الألوان.',
      price: 12000,
      stockQuantity: 5,
      category: crafts._id,
      images: ['/assets/storyphoto.png'],
      attributes: { 'الحجم': ['وسط'], 'اللون': ['أسود ومطرز'], 'نوع المقبض': 'جلد صناعي فاخر' },
      isActive: true,
    },
    {
      name: 'سوار تراثي مطرز يدوياً',
      slug: 'embroidered-bracelet',
      description: 'إكسسوار ناعم ومطرز يدوياً بقطبة الفلاحي لإضافة لمسة تراثية لإطلالتكِ.',
      price: 4500,
      stockQuantity: 15,
      category: accessories._id,
      images: ['/assets/storyphoto1.png'],
      attributes: { 'نوع التطريز': 'قطبة فلاحي هاند ميد', 'اللون': ['أحمر تراثي', 'أسود'] },
      isActive: true,
    },
  ]);

  console.log('✅ Created', products.length, 'products');
  console.log('\n🎉 Done! Admin credentials:');
  console.log('   Email: admin@kanaan.com');
  console.log('   Password: Admin1234');

  mongoose.disconnect();
}).catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
