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


export {
  User,
  Role,
  Modules,
  RoleHasPermission,
  UserSettings,
  Address,
  UserAddress,
  UserContact,
  Currency, Country, City
};