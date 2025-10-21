import { relations, sql } from 'drizzle-orm'
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
} from 'drizzle-orm/mysql-core'

// ========================
// Roles & Permissions
// ========================
export const roleModel = mysqlTable('roles', {
  roleId: int('role_id').primaryKey(),
  roleName: varchar('role_name', { length: 50 }).notNull(),
})

export const userModel = mysqlTable('users', {
  userId: int('user_id').primaryKey().autoincrement(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('PASSWORD', { length: 255 }).notNull(),
  active: boolean('active').notNull().default(true),
  roleId: int('role_id').references(() => roleModel.roleId, {
    onDelete: 'set null',
  }),
  isPasswordResetRequired: boolean('is_password_reset_required').default(true),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
})

export const permissionsModel = mysqlTable('permissions', {
  id: int('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
})

export const rolePermissionsModel = mysqlTable('role_permissions', {
  roleId: int('role_id').references(() => roleModel.roleId),
  permissionId: int('permission_id')
    .notNull()
    .references(() => permissionsModel.id),
})

export const userRolesModel = mysqlTable('user_roles', {
  userId: int('user_id')
    .notNull()
    .references(() => userModel.userId),
  roleId: int('role_id')
    .notNull()
    .references(() => roleModel.roleId),
})

// ========================
// Business Domain Tables
// ========================

// Cloth Items in Batch
export const itemModel = mysqlTable('item', {
  itemId: int('item_id').autoincrement().primaryKey(),
  itemName: varchar('item_name', { length: 100 }).notNull(),
  sellPriece: double('sell_price').notNull(),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

// Customers
export const customerModel = mysqlTable('customer', {
  customerId: int('customer_id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  address: varchar('address', { length: 255 }),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

// Vendors (suppliers)
export const vendorModel = mysqlTable('vendor', {
  vendorId: int('vendor_id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  contactPerson: varchar('contact_person', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  address: varchar('address', { length: 255 }),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

// Bank Accounts
export const bankAccountModel = mysqlTable('bank_account', {
  bankAccountId: int('bank_account_id').autoincrement().primaryKey(),
  bankName: varchar('bank_name', { length: 100 }).notNull(),
  accountNumber: varchar('account_number', { length: 50 }).notNull(),
  branch: varchar('branch', { length: 100 }),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

// Sales (Master)
export const salesMasterModel = mysqlTable('sales_master', {
  saleMasterId: int('sale_master_id').autoincrement().primaryKey(),
  paymentType: mysqlEnum('payment_type', ['cash', 'credit', 'bank']).notNull(),
  bankAccountId: int('bank_account_id').references(
    () => bankAccountModel.bankAccountId,
    { onDelete: 'set null' }
  ),
  customerId: int('customer_id')
    .notNull()
    .references(() => customerModel.customerId, { onDelete: 'cascade' }),
  saleDate: date('sale_date').notNull(),
  totalAmount: double('total_amount').notNull(),
  totalQuantity: int('total_quantity').notNull(),
  notes: text('notes'),
  discountAmount: double('discount_amount').default(0).notNull(),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

// Sale Items (Details)
export const salesDetailsModel = mysqlTable('sales_details', {
  saleDetailsId: int('sale_details_id').autoincrement().primaryKey(),
  saleMasterId: int('sale_master_id')
    .notNull()
    .references(() => salesMasterModel.saleMasterId, { onDelete: 'cascade' }),
  itemId: int('item_id')
    .notNull()
    .references(() => itemModel.itemId, { onDelete: 'cascade' }),
  quantity: int('quantity').notNull(),
  amount: double('amount').notNull(),
  unitPrice: double('unit_price').notNull(),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

// Purchases (Master)
export const purchaseModel = mysqlTable('purchase', {
  purchaseId: int('purchase_id').autoincrement().primaryKey(),
  itemId: int('item_id')
    .notNull()
    .references(() => itemModel.itemId, { onDelete: 'cascade' }),

  totalQuantity: int('total_quantity').notNull(),
  notes: text('notes'),
  vendorId: int('vendor_id')
    .notNull()
    .references(() => vendorModel.vendorId, { onDelete: 'cascade' }),
  paymentType: mysqlEnum('payment_type', ['cash', 'credit', 'bank']).notNull(),
  bankAccountId: int('bank_account_id').references(
    () => bankAccountModel.bankAccountId,
    { onDelete: 'set null' }
  ),
  purchaseDate: date('purchase_date').notNull(),
  totalAmount: double('total_amount').notNull(),
  isSorted: boolean('is_sorted').default(false).notNull(),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const sortingModel = mysqlTable('sorting', {
  sortingId: int('sorting_id').autoincrement().primaryKey(),
  itemId: int('item_id')
    .notNull()
    .references(() => itemModel.itemId, { onDelete: 'cascade' }),
  totalQuantity: int('total_quantity').notNull(),
  notes: text('notes'),
  vendorId: int('vendor_id')
    .notNull()
    .references(() => vendorModel.vendorId, { onDelete: 'cascade' }),
  purchaseId: int('purchase_id')
    .notNull()
    .references(() => purchaseModel.purchaseId, { onDelete: 'cascade' }),
  paymentType: mysqlEnum('payment_type', [
    'cash',
    'credit',
    'bank',
    'mfs',
  ]).notNull(),
  bankAccountId: int('bank_account_id').references(
    () => bankAccountModel.bankAccountId,
    { onDelete: 'set null' }
  ),
  sortingDate: date('sorting_date').notNull(),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

// Expenses
export const accountHeadModel = mysqlTable('account_head', {
  accountHeadId: int('account_head_id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const expenseModel = mysqlTable('expense', {
  expenseId: int('expense_id').autoincrement().primaryKey(),
  accountHeadId: int('account_head').notNull(),
  amount: double('amount').notNull(),
  expenseDate: date('expense_date').notNull(),
  remarks: text('remarks'),
  paymentType: mysqlEnum('payment_type', ['bank', 'cash']).notNull(),
  bankAccountId: int('bank_account_id').references(
    () => bankAccountModel.bankAccountId,
    { onDelete: 'set null' }
  ),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

//store transactions
export const storeTransactionModel = mysqlTable('store_transaction', {
  transactionId: int('transaction_id').autoincrement().primaryKey(),
  itemId: int('item_id').references(() => itemModel.itemId, {
    onDelete: 'set null',
  }),
  quantity: varchar('quantity', { length: 100 }).notNull(),
  transactionDate: date('transaction_date').notNull(),
  reference: varchar('reference', { length: 255 }),
  referenceType: mysqlEnum('reference_type', [
    'purchase',
    'sorting',
    'sales',
    'sales return',
    'purchase return',
    'wastage',
  ]).notNull(),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

// ========================
// Relations
// ========================
export const userRelations = relations(userModel, ({ one }) => ({
  role: one(roleModel, {
    fields: [userModel.roleId],
    references: [roleModel.roleId],
  }),
}))

export const roleRelations = relations(roleModel, ({ many }) => ({
  rolePermissions: many(rolePermissionsModel),
  users: many(userModel),
}))

export const rolePermissionsRelations = relations(
  rolePermissionsModel,
  ({ one }) => ({
    role: one(roleModel, {
      fields: [rolePermissionsModel.roleId],
      references: [roleModel.roleId],
    }),
    permission: one(permissionsModel, {
      fields: [rolePermissionsModel.permissionId],
      references: [permissionsModel.id],
    }),
  })
)

export const salesMasterRelations = relations(
  salesMasterModel,
  ({ one, many }) => ({
    customer: one(customerModel, {
      fields: [salesMasterModel.customerId],
      references: [customerModel.customerId],
    }),
    bankAccount: one(bankAccountModel, {
      fields: [salesMasterModel.bankAccountId],
      references: [bankAccountModel.bankAccountId],
    }),
    details: many(salesDetailsModel),
  })
)

export const salesDetailsRelations = relations(
  salesDetailsModel,
  ({ one }) => ({
    sale: one(salesMasterModel, {
      fields: [salesDetailsModel.saleMasterId],
      references: [salesMasterModel.saleMasterId],
    }),
    item: one(itemModel, {
      fields: [salesDetailsModel.itemId],
      references: [itemModel.itemId],
    }),
  })
)

export const customerRelations = relations(customerModel, ({ many }) => ({
  sales: many(salesMasterModel),
}))

export const bankAccountRelations = relations(bankAccountModel, ({ many }) => ({
  sales: many(salesMasterModel),
  purchases: many(purchaseModel),
  expenses: many(expenseModel),
  sortings: many(sortingModel),
}))

export const itemRelations = relations(itemModel, ({ many }) => ({
  salesDetails: many(salesDetailsModel),
  purchases: many(purchaseModel),
  storeTransactions: many(storeTransactionModel),
  sortings: many(sortingModel),
}))

export const purchaseRelations = relations(purchaseModel, ({ one, many }) => ({
  vendor: one(vendorModel, {
    fields: [purchaseModel.vendorId],
    references: [vendorModel.vendorId],
  }),
  item: one(itemModel, {
    fields: [purchaseModel.itemId],
    references: [itemModel.itemId],
  }),
  bankAccount: one(bankAccountModel, {
    fields: [purchaseModel.bankAccountId],
    references: [bankAccountModel.bankAccountId],
  }),
}))

export const expenseRelations = relations(expenseModel, ({ one }) => ({
  vendor: one(accountHeadModel, {
    fields: [expenseModel.accountHeadId],
    references: [accountHeadModel.accountHeadId],
  }),
  bankAccount: one(bankAccountModel, {
    fields: [expenseModel.bankAccountId],
    references: [bankAccountModel.bankAccountId],
  }),
}))

export const vendorRelations = relations(vendorModel, ({ many }) => ({
  purchases: many(purchaseModel),
  expenses: many(expenseModel),
  sortings: many(sortingModel),
}))

export const storeTransactionRelations = relations(
  storeTransactionModel,
  ({ one }) => ({
    item: one(itemModel, {
      fields: [storeTransactionModel.itemId],
      references: [itemModel.itemId],
    }),
  })
)

export const sortingRelations = relations(sortingModel, ({ one }) => ({
  item: one(itemModel, {
    fields: [sortingModel.itemId],
    references: [itemModel.itemId],
  }),
  vendor: one(vendorModel, {
    fields: [sortingModel.vendorId],
    references: [vendorModel.vendorId],
  }),
  bankAccount: one(bankAccountModel, {
    fields: [sortingModel.bankAccountId],
    references: [bankAccountModel.bankAccountId],
  }),
  purchase: one(purchaseModel, {
    fields: [sortingModel.purchaseId],
    references: [purchaseModel.purchaseId],
  }),
}))

export type User = typeof userModel.$inferSelect
export type NewUser = typeof userModel.$inferInsert
export type Role = typeof roleModel.$inferSelect
export type NewRole = typeof roleModel.$inferInsert
export type Permission = typeof permissionsModel.$inferSelect
export type NewPermission = typeof permissionsModel.$inferInsert
export type UserRole = typeof userRolesModel.$inferSelect
export type NewUserRole = typeof userRolesModel.$inferInsert
export type Item = typeof itemModel.$inferSelect
export type NewItem = typeof itemModel.$inferInsert
export type Customer = typeof customerModel.$inferSelect
export type NewCustomer = typeof customerModel.$inferInsert
export type Vendor = typeof vendorModel.$inferSelect
export type NewVendor = typeof vendorModel.$inferInsert
export type BankAccount = typeof bankAccountModel.$inferSelect
export type NewBankAccount = typeof bankAccountModel.$inferInsert
export type Sale = typeof salesMasterModel.$inferSelect
export type NewSale = typeof salesMasterModel.$inferInsert
export type SaleItem = typeof salesDetailsModel.$inferSelect
export type NewSaleItem = typeof salesDetailsModel.$inferInsert
export type Purchase = typeof purchaseModel.$inferSelect
export type NewPurchase = typeof purchaseModel.$inferInsert
export type Expense = typeof expenseModel.$inferSelect
export type AccountHead = typeof accountHeadModel.$inferSelect
export type NewAccountHead = typeof accountHeadModel.$inferInsert
export type NewExpense = typeof expenseModel.$inferInsert
export type NewSorting = typeof sortingModel.$inferInsert
export type Sorting = typeof sortingModel.$inferSelect
export type StoreTransaction = typeof storeTransactionModel.$inferSelect
export type NewStoreTransaction = typeof storeTransactionModel.$inferInsert
