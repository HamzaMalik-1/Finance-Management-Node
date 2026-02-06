import { Country } from "../models/index.js";
import logger from "../utils/logger.js";
const countries = [
  { id: 1, name: "Pakistan", isoCode: "PK", phoneCode: "+92" },
  { id: 2, name: "United Arab Emirates", isoCode: "AE", phoneCode: "+971" },
  { id: 3, name: "Saudi Arabia", isoCode: "SA", phoneCode: "+966" },
  { id: 4, name: "United States", isoCode: "US", phoneCode: "+1" },
  { id: 5, name: "United Kingdom", isoCode: "GB", phoneCode: "+44" },
  { id: 6, name: "Germany", isoCode: "DE", phoneCode: "+49" },
  { id: 7, name: "Canada", isoCode: "CA", phoneCode: "+1" },
  { id: 8, name: "Australia", isoCode: "AU", phoneCode: "+61" },
];
const CountrySeeder = async () => {
  try {
    for (const country of countries) {
      const [findCountry, created] = await Country.findOrCreate({
        where: { isoCode: country.isoCode }, // ISO Code is unique, safer than ID for lookups
        defaults: country,
      });
      if (created) {
        logger.info(`Country ${country.name} is created`);
      } else {
        if (
          findCountry.name !== country.name ||
          findCountry.phoneCode !== country.phoneCode
        ) {
          let isUpdated = false;
          findCountry.name = country.name;
          findCountry.phoneCode = country.phoneCode;
          await findCountry.save();

          isUpdated = true;
        }
      }
    }
  } catch (error) {
    logger.error(`❌ Error seeding countries: ${error.message}`);
  }
};

export default CountrySeeder