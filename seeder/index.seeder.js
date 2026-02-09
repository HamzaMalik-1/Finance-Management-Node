import ModuleSeeder from "./module.seeder.js";
import CountrySeeder from "./countries.seeder.js"
import CitySeeder from "./cities.seeder.js";
import CategorySeeder from "./category.seeder.js";
import CurrencySeeder from "./currency.seeder.js";
import AccountTypeSeeder from "./account.type.seeder.js";

const mainSeeder = async()=>{

    await ModuleSeeder()
    await CountrySeeder()
    await CitySeeder()
    await CategorySeeder()
    await CurrencySeeder()
    await AccountTypeSeeder()
}

export default mainSeeder