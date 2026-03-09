import UserModel from './User.js';
import RoleModel from './Roles.js';
import ModulesModel from './Modules.js';
import RolesHasPermissionModel from './RolesHasPermission.js';
import UserSettingsModel from './UserSettings.js';
import AddressModel from './Address.js';
import UserAddressModel from './UserAddress.js';
import UserContactModel from './UserContact.js';
import CurrencyModel from './Currency.js';
import CountryModel from './Country.js';
import CityModel from './City.js';
import AccountModel from './Account.js';
import AccountTypeModel from './AccountType.js'; 
import CategoryModel from './Category.js';
import TransactionModel from './Transaction.js';
import BudgetModel from './Budget.js';
import NotificationModel from './Notification.js';
import ContactModel from './Contact.js';
import DebtModel from './Debt.js';
import UserRoleModel from './UserRole.js';
import { sequelize } from '../config/db.js';

// --- Initialization ---
const User = UserModel(sequelize);
const Role = RoleModel(sequelize);
const Modules = ModulesModel(sequelize);
const RoleHasPermission = RolesHasPermissionModel(sequelize);
const UserSettings = UserSettingsModel(sequelize);
const Address = AddressModel(sequelize);
const UserAddress = UserAddressModel(sequelize);
const UserContact = UserContactModel(sequelize);
const Currency = CurrencyModel(sequelize);
const Country = CountryModel(sequelize);
const City = CityModel(sequelize);
const Account = AccountModel(sequelize);
const AccountType = AccountTypeModel(sequelize);
const Category = CategoryModel(sequelize);
const Transaction = TransactionModel(sequelize);
const Budget = BudgetModel(sequelize);
const Notification = NotificationModel(sequelize);
const Contact = ContactModel(sequelize);
const Debt = DebtModel(sequelize);
const UserRole = UserRoleModel(sequelize);

// --- 1. User & Roles (Many-to-Many) ---
User.belongsToMany(Role, { 
  through: UserRole, 
  foreignKey: 'userId', 
  otherKey: 'roleId',
  constraints: false 
});
Role.belongsToMany(User, { 
  through: UserRole, 
  foreignKey: 'roleId', 
  otherKey: 'userId',
  constraints: false 
});

// Helper associations for direct UserRole queries
UserRole.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(UserRole, { foreignKey: 'roleId' });
UserRole.belongsTo(User, { foreignKey: 'userId', constraints: false });
User.hasMany(UserRole, { foreignKey: 'userId', constraints: false });

// --- 2. Roles & Permissions ---
Role.belongsToMany(Modules, { 
  through: RoleHasPermission, 
  foreignKey: 'roleId', 
  otherKey: 'moduleId',
  as: 'permissions' 
});
Modules.belongsToMany(Role, { 
  through: RoleHasPermission, 
  foreignKey: 'moduleId', 
  otherKey: 'roleId' 
});

// --- 3. User Personalization ---
User.hasOne(UserSettings, { foreignKey: 'userId', as: 'settings', constraints: false });
UserSettings.belongsTo(User, { foreignKey: 'userId', constraints: false });

User.hasMany(UserContact, { foreignKey: 'userId', as: 'contacts', constraints: false });
UserContact.belongsTo(User, { foreignKey: 'userId', constraints: false });

User.belongsToMany(Address, { through: UserAddress, foreignKey: 'userId', as: 'addresses', constraints: false });
Address.belongsToMany(User, { through: UserAddress, foreignKey: 'addressId', constraints: false });

// --- 4. Finance & Accounts ---
User.hasMany(Account, { foreignKey: 'userId', as: 'accounts', constraints: false });
Account.belongsTo(User, { foreignKey: 'userId', as: 'user', constraints: false });

AccountType.hasMany(Account, { foreignKey: 'accountTypeId', as: 'accounts' });
Account.belongsTo(AccountType, { foreignKey: 'accountTypeId', as: 'accountType' });

Currency.hasMany(Account, { foreignKey: 'currencyId', as: 'accounts' });
Account.belongsTo(Currency, { foreignKey: 'currencyId', as: 'currency' });

// --- 5. Transactions & Categories ---
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions', constraints: false });
Transaction.belongsTo(User, { foreignKey: 'userId', constraints: false });

Account.hasMany(Transaction, { foreignKey: 'accountId', as: 'accountTransactions' });
Transaction.belongsTo(Account, { foreignKey: 'accountId', as: 'sourceAccount' });

Account.hasMany(Transaction, { foreignKey: 'toAccountId', as: 'receivedTransfers' });
Transaction.belongsTo(Account, { foreignKey: 'toAccountId', as: 'destinationAccount' });

Category.hasMany(Transaction, { foreignKey: 'categoryId', as: 'transactions' });
Transaction.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Category Self-Relationship
Category.hasMany(Category, { foreignKey: 'parentId', as: 'subCategories' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });

// --- 6. Budgeting ---
User.hasMany(Budget, { foreignKey: 'userId', as: 'budgets', constraints: false });
Budget.belongsTo(User, { foreignKey: 'userId', constraints: false });

Category.hasMany(Budget, { foreignKey: 'categoryId', as: 'budgets' });
Budget.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Currency.hasMany(Budget, { foreignKey: 'currencyId', as: 'budgets' });
Budget.belongsTo(Currency, { foreignKey: 'currencyId', as: 'currency' });

// --- 7. Notifications & Communication ---
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', constraints: false });
Notification.belongsTo(User, { foreignKey: 'userId', constraints: false });

User.hasMany(Contact, { foreignKey: 'userId', as: 'userContacts', constraints: false });
Contact.belongsTo(User, { foreignKey: 'userId', constraints: false });

// --- 8. Debt Management (FIXED & CONSOLIDATED) ---
User.hasMany(Debt, { foreignKey: 'userId', as: 'debts', constraints: false });
Debt.belongsTo(User, { foreignKey: 'userId', constraints: false });

Contact.hasMany(Debt, { foreignKey: 'contactId', as: 'personDebts' });
Debt.belongsTo(Contact, { foreignKey: 'contactId', as: 'contactPerson' });

Account.hasMany(Debt, { foreignKey: 'accountId', as: 'accountDebts' });
Debt.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

Debt.hasMany(Transaction, { foreignKey: 'debtId', as: 'repayments' });
Transaction.belongsTo(Debt, { foreignKey: 'debtId', as: 'debt' });

// --- 9. Location Helpers ---
Country.hasMany(City, { foreignKey: 'countryId', as: 'cities' });
City.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });

Address.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });
Address.belongsTo(City, { foreignKey: 'cityId', as: 'city' });

UserSettings.belongsTo(Currency, { foreignKey: 'baseCurrencyId', as: 'currency' });

export {
  User, Role, Modules, RoleHasPermission, UserSettings,
  Address, UserAddress, UserContact, Currency, Country, City,
  Account, AccountType, Category, Transaction, Budget,
  Notification, Contact, Debt, UserRole
};