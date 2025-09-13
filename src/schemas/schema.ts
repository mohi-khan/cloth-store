import { relations, sql } from "drizzle-orm";
import {
  boolean,
  int,
  mysqlTable,
  timestamp,
  varchar,
  text,
  double,
  date,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

// ========================
// Roles & Permissions (basic auth, if still needed)
// ========================

export const userModel = mysqlTable("users", {
  userId: int("user_id").primaryKey().autoincrement(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("PASSWORD", { length: 255 }).notNull(),
  active: boolean("active").notNull().default(true),
  roleId: int("role_id").references(() => roleModel.roleId, {
    onDelete: "set null",
  }),
  isPasswordResetRequired: boolean("is_password_reset_required").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
});

export const userRelations = relations(userModel, ({ one, many }) => ({
  role: one(roleModel, {
    fields: [userModel.roleId],
    references: [roleModel.roleId],
  }),
  // userCompanies: many(userCompanyModel),
}));
export const roleModel = mysqlTable("roles", {
  roleId: int("role_id").primaryKey(),
  roleName: varchar("role_name", { length: 50 }).notNull(),
});

export const permissionsModel = mysqlTable("permissions", {
  id: int("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});
export const rolePermissionsModel = mysqlTable("role_permissions", {
  roleId: int("role_id").references(() => roleModel.roleId),
  permissionId: int("permission_id")
    .notNull()
    .references(() => permissionsModel.id),
});
export const userRolesModel = mysqlTable("user_roles", {
  userId: int("user_id")
    .notNull()
    .references(() => userModel.userId),
  roleId: int("role_id")
    .notNull()
    .references(() => roleModel.roleId),
});

// ========================
// Business Domain Tables
// ========================

// Cloth Items in Batch
export const clothItemModel = mysqlTable("cloth_item", {
  itemId: int("item_id").autoincrement().primaryKey(),
  itemName: varchar("item_name", { length: 100 }).notNull(),
  quantity: int("quantity").notNull(),
  unitCost: double("unit_cost").notNull(), // per item cost
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedBy: int("updated_by"),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

// Customers
export const customerModel = mysqlTable("customer", {
  customerId: int("customer_id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  address: varchar("address", { length: 255 }),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedBy: int("updated_by"),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

// Vendors (suppliers)
export const vendorModel = mysqlTable("vendor", {
  vendorId: int("vendor_id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  contactPerson: varchar("contact_person", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  address: varchar("address", { length: 255 }),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedBy: int("updated_by"),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

// Bank Accounts
export const bankAccountModel = mysqlTable("bank_account", {
  bankAccountId: int("bank_account_id").autoincrement().primaryKey(),
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  branch: varchar("branch", { length: 100 }),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedBy: int("updated_by"),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

// Sales (Master)
export const salesMasterModel = mysqlTable("sales_master", {
  saleId: int("sale_id").autoincrement().primaryKey(),
  paymentType: mysqlEnum("payment_type", ["cash", "credit", "bank"]).notNull(),
  bankAccountId: int("bank_account_id").references(() => bankAccountModel.bankAccountId, {
    onDelete: "set null",
  }),
  customerId: int("customer_id")
    .notNull()
    .references(() => customerModel.customerId, { onDelete: "cascade" }),
  saleDate: date("sale_date").notNull(),
  totalAmount: double("total_amount").notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedBy: int("updated_by"),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

// Sale Items (Details)
export const salesDetailsModel = mysqlTable("sale_details", {
  saleItemId: int("sale_item_id").autoincrement().primaryKey(),
  saleId: int("sale_id")
    .notNull()
    .references(() => salesMasterModel.saleId, { onDelete: "cascade" }),
  itemId: int("item_id")
    .notNull()
    .references(() => clothItemModel.itemId, { onDelete: "cascade" }),
  quantity: int("quantity").notNull(),
  unitPrice: double("unit_price").notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedBy: int("updated_by"),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

// Expenses
export const expenseModel = mysqlTable("expense", {
  expenseId: int("expense_id").autoincrement().primaryKey(),
  vendorId: int("vendor_id").references(() => vendorModel.vendorId, {
    onDelete: "set null",
  }),
  expenseType: varchar("expense_type", { length: 100 }).notNull(), // transport, rent, etc.
  amount: double("amount").notNull(),
  expenseDate: date("expense_date").notNull(),
  remarks: text("remarks"),
  paymentType: mysqlEnum("payment_type", ["bank", "cash"]).notNull(),
  bankAccountId: int("bank_account_id").references(() => bankAccountModel.bankAccountId, {
    onDelete: "set null",
  }),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedBy: int("updated_by"),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export type User = typeof userModel.$inferSelect;
export type NewUser = typeof userModel.$inferInsert;
export type Role = typeof roleModel.$inferSelect;
export type NewRole = typeof roleModel.$inferInsert;
export type Permission = typeof permissionsModel.$inferSelect;
export type NewPermission = typeof permissionsModel.$inferInsert;
export type RolePermission = typeof rolePermissionsModel.$inferSelect;
export type NewRolePermission = typeof rolePermissionsModel.$inferInsert;
export type UserRole = typeof userRolesModel.$inferSelect;
export type NewUserRole = typeof userRolesModel.$inferInsert;
export type ClothItem = typeof clothItemModel.$inferSelect;
export type NewClothItem = typeof clothItemModel.$inferInsert;
export type Customer = typeof customerModel.$inferSelect;
export type NewCustomer = typeof customerModel.$inferInsert;
export type Vendor = typeof vendorModel.$inferSelect;
export type NewVendor = typeof vendorModel.$inferInsert;
export type BankAccount = typeof bankAccountModel.$inferSelect;
export type NewBankAccount = typeof bankAccountModel.$inferInsert;
export type Sale = typeof salesMasterModel.$inferSelect;
export type NewSale = typeof salesMasterModel.$inferInsert;
export type SaleItem = typeof salesDetailsModel.$inferSelect;
export type NewSaleItem = typeof salesDetailsModel.$inferInsert;
export type Expense = typeof expenseModel.$inferSelect;
export type NewExpense = typeof expenseModel.$inferInsert;