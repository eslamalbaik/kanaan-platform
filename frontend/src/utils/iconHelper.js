import {
  Shirt,Package,
  Gem, Wheat ,Spool,
  Hammer,Gamepad2,
  ShoppingBag,Home,
  Heart,
  Flower,
  Palette,
  BookOpen,
  Coffee,
  Gift,
  Sparkles,

  Utensils,
  Apple,
  Croissant,
  Milk,
  Drumstick,
  Pizza,

  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Watch,

  Truck,
  ShoppingCart,
  Store,
  Tag,
  CreditCard,

  Leaf,
  TreePine,
  Sun,
  Moon,
  Cloud,

  Scissors,
  Brush,
  Paintbrush,
  ShirtIcon,
  Footprints,
  Backpack,  

  LampDesk,
  Armchair,
  BedDouble,
  Percent,
  Barcode,
  ReceiptText
} from "lucide-react";

export const categoryIcons = {
  Shirt,
  Package,
  Gem,
    Wheat,
    Spool,
  Hammer,
  Gamepad2,
  ShoppingBag,
  Home,
  Heart,
  Flower,
  Palette,
  BookOpen,
  Coffee,
  Gift,
  Sparkles,

  Utensils,
  Apple,
  Croissant,
  Milk,
  Drumstick,
  Pizza,

  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Watch,

  Truck,
  ShoppingCart,
  Store,
  Tag,
  CreditCard,

  Leaf,
  TreePine,
  Sun,
  Moon,
  Cloud,

  Scissors,
  Brush,
  Paintbrush,
  ShirtIcon,
  Footprints,
  Backpack,   LampDesk,
  Armchair,
  BedDouble,
  Percent,
  Barcode,
  ReceiptText

  
};

export const availableIcons =
  Object.entries(categoryIcons);

export const getIconComponent = (iconName) =>
  categoryIcons[iconName] || Package;