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
import { sequelize } from '../config/db.js';


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
const Contact = ContactModel(sequelize)
const Debt =DebtModel(sequelize)


Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });


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


User.hasOne(UserSettings, { foreignKey: 'userId', as: 'settings', onDelete: 'CASCADE' });
UserSettings.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(UserContact, { foreignKey: 'userId', as: 'contacts', onDelete: 'CASCADE' });
UserContact.belongsTo(User, { foreignKey: 'userId' });


User.belongsToMany(Address, { through: UserAddress, foreignKey: 'userId', as: 'addresses' });
Address.belongsToMany(User, { through: UserAddress, foreignKey: 'addressId' });


// Country & City (One-to-Many)
Country.hasMany(City, { foreignKey: 'countryId', as: 'cities' });
City.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });

// Linking Master Tables to Address
// Instead of just an ID, Address now points to real Country/City records
Address.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });
Address.belongsTo(City, { foreignKey: 'cityId', as: 'city' });

// Linking Currency to UserSettings
UserSettings.belongsTo(Currency, { foreignKey: 'baseCurrencyId', as: 'currency' });


// 1. User <-> Account (One-to-Many)
User.hasMany(Account, { foreignKey: 'userId', as: 'accounts' });
Account.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 2. AccountType <-> Account (One-to-Many)
AccountType.hasMany(Account, { foreignKey: 'accountTypeId', as: 'accounts' });
Account.belongsTo(AccountType, { foreignKey: 'accountTypeId', as: 'accountType' });

// 3. Currency <-> Account (One-to-Many)
Currency.hasMany(Account, { foreignKey: 'currencyId', as: 'accounts' });
Account.belongsTo(Currency, { foreignKey: 'currencyId', as: 'currency' });

// 1. One-to-Many: Parent Category to Sub-Categories
Category.hasMany(Category, { 
  foreignKey: 'parentId', 
  as: 'subCategories' 
});

// 2. Many-to-One: Sub-Category back to its Parent
Category.belongsTo(Category, { 
  foreignKey: 'parentId', 
  as: 'parent' 
});


// 1. Basic Links
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

Account.hasMany(Transaction, { foreignKey: 'accountId', as: 'accountTransactions' });
Transaction.belongsTo(Account, { foreignKey: 'accountId', as: 'sourceAccount' });

// 2. Special Link for Transfers
Account.hasMany(Transaction, { foreignKey: 'toAccountId', as: 'receivedTransfers' });
Transaction.belongsTo(Account, { foreignKey: 'toAccountId', as: 'destinationAccount' });

Category.hasMany(Transaction, { foreignKey: 'categoryId', as: 'transactions' });
Transaction.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// 1. User <-> Budget
User.hasMany(Budget, { foreignKey: 'userId', as: 'budgets' });
Budget.belongsTo(User, { foreignKey: 'userId' });

// 2. Category <-> Budget
Category.hasMany(Budget, { foreignKey: 'categoryId', as: 'budgets' });
Budget.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// 3. Currency <-> Budget
Currency.hasMany(Budget, { foreignKey: 'currencyId', as: 'budgets' });
Budget.belongsTo(Currency, { foreignKey: 'currencyId', as: 'currency' });

// --- Notification Relationship ---
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// --- Contact Relationships ---
User.hasMany(Contact, { foreignKey: 'userId', as: 'userContacts' });
Contact.belongsTo(User, { foreignKey: 'userId' });

// --- Debt Relationships ---
User.hasMany(Debt, { foreignKey: 'userId', as: 'debts' });
Debt.belongsTo(User, { foreignKey: 'userId' });

Contact.hasMany(Debt, { foreignKey: 'contactId', as: 'debts' });
Debt.belongsTo(Contact, { foreignKey: 'contact', as: 'contactPerson' });

Account.hasMany(Debt, { foreignKey: 'accountId', as: 'debts' });
Debt.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

// --- Linking Transactions to Debts ---
// This allows you to see all repayments for a specific loan
Debt.hasMany(Transaction, { foreignKey: 'debtId', as: 'repayments' });
Transaction.belongsTo(Debt, { foreignKey: 'debtId', as: 'debt' });

export {
  User,
  Role,
  Modules,
  RoleHasPermission,
  UserSettings,
  Address,
  UserAddress,
  UserContact,
  Currency, Country, City,
  Account, AccountType,
  Category,
  Transaction,
  Budget,
  Notification,
  Contact,
  Debt
};