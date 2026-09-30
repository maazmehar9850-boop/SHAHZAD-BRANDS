import {
  PrismaClient,
  UserType,
  OrderStatus,
  PaymentStatus,
  PaymentMethodType,




  
  DiscountType,
  CouponScope,
  InventoryTransactionType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { ALL_PERMISSION_KEYS, PERMISSIONS, roleDefaultPermissions } from "../src/lib/permissions";
import { BANNER_IMAGES, CATEGORY_IMAGES, productImagePath } from "../src/lib/image-paths";

const prisma = new PrismaClient();

const PERMISSION_META: Record<string, { name: string; description: string }> = {
  [PERMISSIONS.VIEW_PRODUCTS]: { name: "View Products", description: "Browse product catalog in admin" },
  [PERMISSIONS.ADD_PRODUCTS]: { name: "Add Products", description: "Create new products" },
  [PERMISSIONS.EDIT_PRODUCTS]: { name: "Edit Products", description: "Update product details" },
  [PERMISSIONS.DELETE_PRODUCTS]: { name: "Delete Products", description: "Remove products" },
  [PERMISSIONS.VIEW_INVENTORY]: { name: "View Inventory", description: "View stock levels" },
  [PERMISSIONS.MANAGE_INVENTORY]: { name: "Manage Inventory", description: "Adjust stock" },
  [PERMISSIONS.VIEW_ORDERS]: { name: "View Orders", description: "View customer orders" },
  [PERMISSIONS.MANAGE_ORDERS]: { name: "Manage Orders", description: "Update order status" },
  [PERMISSIONS.CREATE_BILLS]: { name: "Create Bills", description: "POS and invoicing" },
  [PERMISSIONS.REFUND_BILLS]: { name: "Refund Bills", description: "Process refunds" },
  [PERMISSIONS.VIEW_REPORTS]: { name: "View Reports", description: "Export reports" },
  [PERMISSIONS.MANAGE_STAFF]: { name: "Manage Staff", description: "Staff accounts and roles" },
  [PERMISSIONS.MANAGE_SETTINGS]: { name: "Manage Settings", description: "Store settings" },
  [PERMISSIONS.VIEW_CUSTOMERS]: { name: "View Customers", description: "Customer list" },
  [PERMISSIONS.MANAGE_CUSTOMERS]: { name: "Manage Customers", description: "Edit customers" },
  [PERMISSIONS.MANAGE_COUPONS]: { name: "Manage Coupons", description: "Coupon codes" },
  [PERMISSIONS.MANAGE_EXPENSES]: { name: "Manage Expenses", description: "Business expenses" },
  [PERMISSIONS.VIEW_INVOICES]: { name: "View Invoices", description: "Invoice history" },
  [PERMISSIONS.MANAGE_RETURNS]: { name: "Manage Returns", description: "Return requests" },
};

async function main() {
  await prisma.returnItem.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.setting.deleteMany();

  for (const key of ALL_PERMISSION_KEYS) {
    const meta = PERMISSION_META[key];
    await prisma.permission.create({
      data: { key, name: meta.name, description: meta.description },
    });
  }

  const permissions = await prisma.permission.findMany();
  const permByKey = Object.fromEntries(permissions.map((p) => [p.key, p.id]));

  const roleDefs = [
    { name: "Super Admin", slug: "super-admin", description: "Full system access", isSystem: true },
    { name: "Admin", slug: "admin", description: "Store administrator", isSystem: true },
    { name: "Manager", slug: "manager", description: "Operations manager", isSystem: true },
    { name: "Cashier", slug: "cashier", description: "Point of sale", isSystem: true },
    { name: "Staff", slug: "staff", description: "Limited staff access", isSystem: true },
  ];

  const roles: Record<string, string> = {};
  for (const r of roleDefs) {
    const role = await prisma.role.create({ data: r });
    roles[r.slug] = role.id;
    const keys = roleDefaultPermissions(r.slug);
    for (const key of keys) {
      if (key === "*") continue;
      const permissionId = permByKey[key];
      if (permissionId) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId },
        });
      }
    }
  }

  const settings: Record<string, string> = {
    store_name: "Shahzad Brands",
    store_address: "Main Boulevard, Gulberg III, Lahore, Pakistan",
    store_phone: "+92 300 1234567",
    store_email: "hello@shahzadbrands.com",
    tax_rate: "5",
    currency: "PKR",
    invoice_prefix: "INV",
    order_prefix: "ORD",
    shipping_flat: "250",
    social_facebook: "https://facebook.com/shahzadbrands",
    social_instagram: "https://instagram.com/shahzadbrands",
    social_twitter: "https://twitter.com/shahzadbrands",
    seo_description: "Premium fashion and garments by Shahzad Brands — quality fabrics, timeless style.",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.create({ data: { key, value } });
  }

  const adminHash = await bcrypt.hash("Admin@123", 12);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@shahzadbrands.com",
      passwordHash: adminHash,
      name: "Shahzad Admin",
      phone: "+92 300 1111111",
      type: UserType.STAFF,
      staffProfile: {
        create: {
          employeeId: "EMP-001",
          roleId: roles["super-admin"],
        },
      },
    },
  });

  const managerHash = await bcrypt.hash("Manager@123", 12);
  await prisma.user.create({
    data: {
      email: "manager@shahzadbrands.com",
      passwordHash: managerHash,
      name: "Store Manager",
      type: UserType.STAFF,
      staffProfile: {
        create: { employeeId: "EMP-002", roleId: roles["manager"] },
      },
    },
  });

  const cashierHash = await bcrypt.hash("Cashier@123", 12);
  await prisma.user.create({
    data: {
      email: "cashier@shahzadbrands.com",
      passwordHash: cashierHash,
      name: "POS Cashier",
      type: UserType.STAFF,
      staffProfile: {
        create: { employeeId: "EMP-003", roleId: roles["cashier"] },
      },
    },
  });

  const customerPassword = await bcrypt.hash("Customer@123", 12);
  const customer1 = await prisma.user.create({
    data: {
      email: "ali.ahmed@example.com",
      passwordHash: customerPassword,
      name: "Ali Ahmed",
      phone: "+92 321 5551234",
      type: UserType.CUSTOMER,
      customerProfile: { create: {} },
      addresses: {
        create: {
          label: "Home",
          fullName: "Ali Ahmed",
          phone: "+92 321 5551234",
          address: "45 Model Town",
          city: "Lahore",
          area: "Model Town",
          postalCode: "54000",
          isDefault: true,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "sara.khan@example.com",
      passwordHash: customerPassword,
      name: "Sara Khan",
      phone: "+92 333 7778899",
      type: UserType.CUSTOMER,
      customerProfile: { create: {} },
    },
  });

  const brands = await Promise.all(
    [
      { name: "Shahzad Signature", slug: "shahzad-signature" },
      { name: "Urban Thread", slug: "urban-thread" },
      { name: "Heritage Loom", slug: "heritage-loom" },
    ].map((b) => prisma.brand.create({ data: b }))
  );

  const catMen = await prisma.category.create({
    data: {
      name: "Men",
      slug: "men",
      description: "Men's clothing and accessories",
      sortOrder: 1,
      image: CATEGORY_IMAGES.men,
    },
  });
  const catWomen = await prisma.category.create({
    data: {
      name: "Women",
      slug: "women",
      description: "Women's fashion",
      sortOrder: 2,
      image: CATEGORY_IMAGES.women,
    },
  });
  const catKids = await prisma.category.create({
    data: {
      name: "Kids",
      slug: "kids",
      description: "Kids wear",
      sortOrder: 3,
      image: CATEGORY_IMAGES.kids,
    },
  });
  await prisma.category.create({
    data: {
      name: "Shirts",
      slug: "shirts",
      parentId: catMen.id,
      sortOrder: 1,
    },
  });
  await prisma.category.create({
    data: {
      name: "Dresses",
      slug: "dresses",
      parentId: catWomen.id,
      sortOrder: 1,
    },
  });

  const productDefs = [
    {
      name: "Classic Oxford Shirt",
      slug: "classic-oxford-shirt",
      sku: "SB-M-001",
      price: 4500,
      salePrice: 3990,
      costPrice: 2200,
      stock: 48,
      brandIdx: 0,
      categoryId: catMen.id,
      featured: true,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b56?w=800",
    },
    {
      name: "Slim Fit Chino",
      slug: "slim-fit-chino",
      sku: "SB-M-002",
      price: 5200,
      salePrice: null,
      costPrice: 2600,
      stock: 35,
      brandIdx: 1,
      categoryId: catMen.id,
      featured: false,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1473966968600-fa801b869a2a?w=800",
    },
    {
      name: "Linen Summer Blazer",
      slug: "linen-summer-blazer",
      sku: "SB-M-003",
      price: 12500,
      salePrice: 10999,
      costPrice: 6500,
      stock: 18,
      brandIdx: 0,
      categoryId: catMen.id,
      featured: true,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
    },
    {
      name: "Premium Polo Tee",
      slug: "premium-polo-tee",
      sku: "SB-M-004",
      price: 3200,
      salePrice: null,
      costPrice: 1500,
      stock: 60,
      brandIdx: 1,
      categoryId: catMen.id,
      featured: false,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800",
    },
    {
      name: "Floral Midi Dress",
      slug: "floral-midi-dress",
      sku: "SB-W-001",
      price: 8900,
      salePrice: 7490,
      costPrice: 4200,
      stock: 25,
      brandIdx: 2,
      categoryId: catWomen.id,
      featured: true,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
    },
    {
      name: "Silk Evening Gown",
      slug: "silk-evening-gown",
      sku: "SB-W-002",
      price: 18500,
      salePrice: null,
      costPrice: 9000,
      stock: 12,
      brandIdx: 0,
      categoryId: catWomen.id,
      featured: true,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800",
    },
    {
      name: "Casual Denim Jacket",
      slug: "casual-denim-jacket",
      sku: "SB-W-003",
      price: 7800,
      salePrice: 6990,
      costPrice: 3800,
      stock: 30,
      brandIdx: 1,
      categoryId: catWomen.id,
      featured: false,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800",
    },
    {
      name: "Embroidered Kurti",
      slug: "embroidered-kurti",
      sku: "SB-W-004",
      price: 5500,
      salePrice: null,
      costPrice: 2700,
      stock: 40,
      brandIdx: 2,
      categoryId: catWomen.id,
      featured: false,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1583391735258-f2c97d7a0f42?w=800",
    },
    {
      name: "Kids Cotton Set",
      slug: "kids-cotton-set",
      sku: "SB-K-001",
      price: 2800,
      salePrice: 2490,
      costPrice: 1200,
      stock: 55,
      brandIdx: 1,
      categoryId: catKids.id,
      featured: false,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1519238263530-99bdd884df10?w=800",
    },
    {
      name: "Kids Party Dress",
      slug: "kids-party-dress",
      sku: "SB-K-002",
      price: 4200,
      salePrice: null,
      costPrice: 2000,
      stock: 28,
      brandIdx: 2,
      categoryId: catKids.id,
      featured: true,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1503341451584-0c2d0f8e2a1b?w=800",
    },
    {
      name: "Wool Winter Coat",
      slug: "wool-winter-coat",
      sku: "SB-M-005",
      price: 15900,
      salePrice: 13990,
      costPrice: 8000,
      stock: 15,
      brandIdx: 0,
      categoryId: catMen.id,
      featured: true,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800",
    },
    {
      name: "Athleisure Joggers",
      slug: "athleisure-joggers",
      sku: "SB-M-006",
      price: 3800,
      salePrice: null,
      costPrice: 1800,
      stock: 70,
      brandIdx: 1,
      categoryId: catMen.id,
      featured: false,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
    },
  ];

  const products = [];
  for (let i = 0; i < productDefs.length; i++) {
    const p = productDefs[i];
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: `${p.name} — crafted with premium fabrics for Shahzad Brands customers.`,
        price: p.price,
        salePrice: p.salePrice,
        costPrice: p.costPrice,
        stockQuantity: p.stock,
        brandId: brands[p.brandIdx].id,
        categoryId: p.categoryId,
        isFeatured: p.featured,
        isBestseller: p.bestseller,
        images: {
          create: [{ url: productImagePath(i), alt: p.name, sortOrder: 0 }],
        },
      },
    });
    products.push(product);
  }

  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        type: DiscountType.PERCENTAGE,
        value: 10,
        scope: CouponScope.ORDER,
        minOrder: 3000,
        usageLimit: 500,
        isActive: true,
      },
      {
        code: "FLAT500",
        type: DiscountType.FIXED,
        value: 500,
        scope: CouponScope.ORDER,
        minOrder: 5000,
        usageLimit: 100,
        isActive: true,
      },
      {
        code: "VIP15",
        type: DiscountType.PERCENTAGE,
        value: 15,
        scope: CouponScope.ORDER,
        minOrder: 10000,
        isActive: true,
      },
    ],
  });

  await prisma.banner.createMany({
    data: [
      {
        title: "New Season Collection",
        subtitle: "Up to 30% off selected styles",
        image: BANNER_IMAGES[0],
        link: "/products",
        sortOrder: 0,
      },
      {
        title: "Premium Fabrics",
        subtitle: "Shahzad Signature line now in store",
        image: BANNER_IMAGES[1],
        link: "/products?featured=true",
        sortOrder: 1,
      },
      {
        title: "Kids Festive Wear",
        subtitle: "Celebrate in comfort and color",
        image: BANNER_IMAGES[2],
        link: "/products?category=kids",
        sortOrder: 2,
      },
    ],
  });

  await prisma.testimonial.createMany({
    data: [
      {
        name: "Fatima R.",
        role: "Lahore",
        content: "Outstanding quality and fast delivery. My go-to for formal wear.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
      },
      {
        name: "Hamza S.",
        role: "Islamabad",
        content: "The oxford shirts fit perfectly. Premium feel at a fair price.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      },
      {
        name: "Ayesha M.",
        role: "Karachi",
        content: "Beautiful dresses and excellent customer service on WhatsApp.",
        rating: 4,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
      },
    ],
  });

  const staffProfile = await prisma.staffProfile.findFirst({
    where: { userId: adminUser.id },
  });

  await prisma.expense.createMany({
    data: [
      {
        title: "Shop rent — March",
        category: "Rent",
        amount: 85000,
        date: new Date("2025-03-01"),
        paymentMethod: PaymentMethodType.BANK_TRANSFER,
        staffId: adminUser.id,
      },
      {
        title: "Fabric supplier payment",
        category: "Inventory",
        amount: 125000,
        date: new Date("2025-03-15"),
        paymentMethod: PaymentMethodType.BANK_TRANSFER,
        staffId: adminUser.id,
      },
      {
        title: "Electricity bill",
        category: "Utilities",
        amount: 18500,
        date: new Date("2025-03-20"),
        paymentMethod: PaymentMethodType.CASH,
        staffId: adminUser.id,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        title: "Low stock alert",
        message: "Silk Evening Gown is below threshold (12 units).",
        type: "inventory",
        link: "/admin/inventory",
      },
      {
        userId: adminUser.id,
        title: "New order",
        message: "Order ORD-000001 was placed online.",
        type: "order",
        link: "/admin/orders",
      },
    ],
  });

  const p0 = products[0];
  const p4 = products[4];
  const subtotal = 3990 + 7490;
  const shipping = 250;
  const discount = 0;
  const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100;
  const total = subtotal - discount + shipping + tax;

  const order = await prisma.order.create({
    data: {
      orderNumber: "ORD-000001",
      userId: customer1.id,
      shippingAddress: "45 Model Town",
      shippingCity: "Lahore",
      shippingArea: "Model Town",
      shippingPostal: "54000",
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethodType.COD,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      items: {
        create: [
          {
            productId: p0.id,
            productName: p0.name,
            sku: p0.sku,
            quantity: 1,
            unitPrice: 3990,
            total: 3990,
          },
          {
            productId: p4.id,
            productName: p4.name,
            sku: p4.sku,
            quantity: 1,
            unitPrice: 7490,
            total: 7490,
          },
        ],
      },
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-000001",
      orderId: order.id,
      staffId: staffProfile?.id,
      customerName: "Ali Ahmed",
      customerPhone: "+92 321 5551234",
      customerEmail: customer1.email,
      subtotal,
      discount,
      tax,
      total,
      amountPaid: total,
      changeDue: 0,
      paymentMethod: PaymentMethodType.COD,
      paymentStatus: PaymentStatus.PAID,
      items: {
        create: [
          {
            productId: p0.id,
            productName: p0.name,
            sku: p0.sku,
            quantity: 1,
            unitPrice: 3990,
            total: 3990,
          },
          {
            productId: p4.id,
            productName: p4.name,
            sku: p4.sku,
            quantity: 1,
            unitPrice: 7490,
            total: 7490,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: "PAY-000001",
      orderId: order.id,
      invoiceId: invoice.id,
      amount: total,
      method: PaymentMethodType.COD,
      status: PaymentStatus.PAID,
      staffId: staffProfile?.id,
    },
  });

  await prisma.inventoryTransaction.createMany({
    data: [
      {
        productId: p0.id,
        type: InventoryTransactionType.ORDER,
        quantity: -1,
        beforeQty: 48,
        afterQty: 47,
        reference: order.orderNumber,
      },
      {
        productId: p4.id,
        type: InventoryTransactionType.ORDER,
        quantity: -1,
        beforeQty: 25,
        afterQty: 24,
        reference: order.orderNumber,
      },
    ],
  });

  await prisma.product.update({ where: { id: p0.id }, data: { stockQuantity: 47 } });
  await prisma.product.update({ where: { id: p4.id }, data: { stockQuantity: 24 } });

  console.log("Seed complete.");
  console.log("Staff login: admin@shahzadbrands.com / Admin@123");
  console.log("Customer login: ali.ahmed@example.com / Customer@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
