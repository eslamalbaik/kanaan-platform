export const productsData = [
  {
    _id: "64f3a1b2c3d4e5f6a7b8c9d1", 
    name: "ثوب مجدلاوي مطرز يدوياً كلاسيك",
    description: "تطريز فلسطيني تراثي أصيل مصنوع بدقة وعناية بأيدي نساء محليات.",
    price: 35000,   
    averageRating: 4.9,
    reviewCount: 24,
    category: { 
      _id: "64f3a1b2c3d4e5f6a7b8c9a1", 
      name: "ملابس" 
    }, 
    subCategory: "dresses", 
    isCustomizable: true,    
    isAvailable: true,
    stockQuantity: 5,        
    images: ["/assets/thobe-product.png"],
    attributes: {
      "النوع": "ملابس",
      "الطول": ["طويل"],
      "المقاس": ["صغير", "متوسط", "كبير"],
      "اللون": ["أبيض", "احمر قاتي"],
      "الخامة": "قماش مطرز"
    }
  },
  {
    _id: "64f3a1b2c3d4e5f6a7b8c9d2",
    name: "زيت زيتون بكر ممتاز - عصرة أولى",
    description: "زيت زيتون فلسطيني نقي من خيرات الأرض، معصور على البارد لحفظ النكهة والجودة.",
    price: 12000,   
    averageRating: 5.0,
    reviewCount: 42,
    category: { 
      _id: "64f3a1b2c3d4e5f6a7b8c9a2", 
      name: "منتجات غذائية" 
    },
    subCategory: "oils-cheese", 
    isCustomizable: false,   
    isAvailable: true,
    stockQuantity: 30,
    images: ["/assets/p-ol-oil.png"],
    attributes: {
      "الوزن": ["1 لتر", "4 لتر"],
      "نوع التعبئة": "عبوة زجاجية",
      "فترة الصلاحية": "سنتين"
    }
  },
  {
    _id: "64f3a1b2c3d4e5f6a7b8c9d3",
    name: "صينية قش ملونة مصنوعة يدويًا",
    description: "صينية مصنوعة يدوياً من القش الطبيعي الملون بنقوش تراثية روعة.",
    price: 8500,    
    averageRating: 4.7,
    reviewCount: 18,
    category: { 
      _id: "64f3a1b2c3d4e5f6a7b8c9a3", 
      name: "حرف يدوية" 
    },
    isCustomizable: true,   
    isAvailable: true,
    stockQuantity: 3,
    images: ["/assets/h-st-tray.png"],
    attributes: {
      "القطر": ["30 سم", "40 سم"],
      "اللون": ["متعدد الألوان"],
      "نوع القش": "قش طبيعي"
    }
  }, 
  { 
    _id: "64f3a1b2c3d4e5f6a7b8c9d5", 
    name: "سوار تراثي مطرز يدوياً", 
    description: "إكسسوار ناعم ومطرز يدوياً بقطبة الفلاحي لإضافة لمسة تراثية لإطلالتكِ.",
    price: 4500,  
    averageRating: 4.8, 
    reviewCount: 24, 
    category: { 
      _id: "64f3a1b2c3d4e5f6a7b8c9a4", 
      name: "اكسسوارات" 
    },
    isCustomizable: true,
    isAvailable: true,
    stockQuantity: 15,
    images: ["/assets/h-st-tray.png"],
    attributes: {
      "نوع التطريز": "قطبة فلاحي هاند ميد",
      "اللون": ["أحمر تراثي", "أسود"]
    }
  },
  { 
    _id: "64f3a1b2c3d4e5f6a7b8c9d6", 
    name: "حقيبة تطريز فلسطيني أنيقة", 
    description: "حقيبة يد تجمع بين العصرية والأصالة بنقوش تطريز مميزة متناسقة الألوان.",
    price: 12000, 
    averageRating: 4.9, 
    reviewCount: 38, 
    category: { 
      _id: "64f3a1b2c3d4e5f6a7b8c9a3", 
      name: "حرف يدوية" 
    },      
    isCustomizable: false,
    isAvailable: true,
    stockQuantity: 5,
    images: ["/assets/h-st-tray.png"],
    attributes: {
      "الحجم": ["وسط"],
      "اللون": ["أسود ومطرز"],
      "نوع المقبض": "جلد صناعي فاخر"
    }
  },
  { 
    _id: "64f3a1b2c3d4e5f6a7b8c9d7", 
    name: "زيت زيتون بكر ممتاز - سعة أصغر", 
    description: "قطفة أولى وعصرة تقليدية، معبأ بعبوات أصغر تناسب الاستخدام الخفيف.",
    price: 8500,  
    averageRating: 5.0, 
    reviewCount: 61, 
    category: { 
      _id: "64f3a1b2c3d4e5f6a7b8c9a2", 
      name: "منتجات غذائية" 
    },   
    subCategory: "oils-cheese",     
    isCustomizable: false,
    isAvailable: true,
    stockQuantity: 20,
    images: ["/assets/h-st-tray.png"],
    attributes: {
      "الوزن": ["500 مل"],
      "نوع التعبئة": "عبوة زجاجية"
    }
  },
  { 
    _id: "64f3a1b2c3d4e5f6a7b8c9d8", 
    name: "صابون النابلسي الزيتي الطبيعي", 
    description: "صابون طبيعي 100% مصنوع من زيت الزيتون الصافي للعناية الفائقة والنظافة اليومية.",
    price: 3000,  
    averageRating: 4.7, 
    reviewCount: 45, 
    category: { 
      _id: "64f3a1b2c3d4e5f6a7b8c9a2", 
      name: "منتجات غذائية" 
    },    
    isCustomizable: false,
    isAvailable: true,
    stockQuantity: 40,
    images: ["/assets/h-st-tray.png"],
    attributes: {
      "الوزن": ["150 غرام"],
      "المكونات": "زيت زيتون بكر، صودا طبيعية"
    }
  },
  { 
    _id: "64f3a1b2c3d4e5f6a7b8c9d9", 
    name: "معمول فلسطيني فاخر بالتمر", 
    description: "معمول هش يذوب في الفم، محشو بأجود أنواع عجوة التمر الفاخرة والبهارات الأصلية.",
    price: 5500,  
    averageRating: 4.6, 
    reviewCount: 19, 
    category: { 
      _id: "64f3a1b2c3d4e5f6a7b8c9a2", 
      name: "منتجات غذائية" 
    },        
    isCustomizable: false,
    isAvailable: true,
    stockQuantity: 25,
    images: ["/assets/h-st-tray.png"],
    attributes: {
      "الوزن": ["1 كيلو جرام"],
      "الحشوة": "تمر عجوة فاخر"
    }
  },
  { 
    _id: "64f3a1b2c3d4e5f6a7b8c9d0", 
    name: "ثوب مجدلاوي مطرز يدوياً عصري", 
    description: "تصميم مدمج يجمع الأصالة التراثية بلمسات وتفاصيل تلائم المناسبات الحديثة.",
    price: 32000, 
    averageRating: 4.9, 
    reviewCount: 12, 
    category: { 
      _id: "64f3a1b2c3d4e5f6a7b8c9a1", 
      name: "ملابس" 
    }, 
    isCustomizable: true,
    isAvailable: true,
    stockQuantity: 2,
    images: ["/assets/h-st-tray.png"],
    attributes: {
      "النوع": "ملابس",
      "الطول": ["طويل"],
      "المقاس": ["S", "M", "L"],
      "اللون": ["أسود ملكي", "تطريز نيلي"],
      "الخامة": "حرير كريب ومطرز"
    }
  },
  { 
    _id: "64f3a1b2c3d4e5f6a7b8c9e1", 
    name: "طحينة سمسم صافية تقليدية", 
    description: "طحينة مستخلصة من بذور السمسم المحمصة بدقة وعناية على الطريقة التقليدية السلسة.",
    price: 4000,  
    averageRating: 4.8, 
    reviewCount: 33, 
    category: { 
      _id: "64f3a1b2c3d4e5f6a7b8c9a2", 
      name: "منتجات غذائية" 
    },        
    isCustomizable: false,
    isAvailable: true,
    stockQuantity: 12,
    images: ["/assets/h-st-tray.png"],
    attributes: {
      "الوزن": ["900 غرام"],
      "المكونات": "سمسم صافي 100%"
    }
  },
  { 
    _id: "64f3a1b2c3d4e5f6a7b8c9e2", 
    name: "عسل السدر الفلسطيني الطبيعي", 
    description: "عسل سدر طبيعي 100% مستخلص من مناحلنا المحلية، غني بالفوائد والمذاق الأصيل.",
    price: 15000, 
    averageRating: 5.0, 
    reviewCount: 27, 
    category: { 
      _id: "64f3a1b2c3d4e5f6a7b8c9a2", 
      name: "منتجات غذائية" 
    },        
    isCustomizable: false,
    isAvailable: true,
    stockQuantity: 8,
    images: ["/assets/h-st-tray.png"],
    attributes: {
      "الوزن": ["500 غرام", "1 كيلو جرام"],
      "النوع": "عسل سدر جبلي أصيل"
    }
  }
];