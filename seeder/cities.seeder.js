import { City } from "../models/index.js";
import logger from "../utils/logger.js";


const cities = [
  // Pakistan (country_id: 1)
  { id: 1, name: 'Karachi', countryId: 1 },
  { id: 2, name: 'Lahore', countryId: 1 },
  { id: 3, name: 'Islamabad', countryId: 1 },
  { id: 4, name: 'Faisalabad', countryId: 1 },
  { id: 5, name: 'Multan', countryId: 1 },

  // UAE (country_id: 2)
  { id: 6, name: 'Dubai', countryId: 2 },
  { id: 7, name: 'Abu Dhabi', countryId: 2 },
  { id: 8, name: 'Sharjah', countryId: 2 },

  // Saudi Arabia (country_id: 3)
  { id: 9, name: 'Riyadh', countryId: 3 },
  { id: 10, name: 'Jeddah', countryId: 3 },
  { id: 11, name: 'Dammam', countryId: 3 },

  // USA (country_id: 4)
  { id: 12, name: 'New York', countryId: 4 },
  { id: 13, name: 'San Francisco', countryId: 4 },
  { id: 14, name: 'Chicago', countryId: 4 },

  // UK (country_id: 5)
  { id: 15, name: 'London', countryId: 5 },
  { id: 16, name: 'Manchester', countryId: 5 },
  { id: 17, name: 'Birmingham', countryId: 5 }
];

const CitySeeder= async()=>{
    try {
        for ( const city of cities)
        {
            const [cityFind,created]=await City.findOrCreate({
                where:{name:city.name},
                defaults:city

                
            })
            if(created)
            {
                logger.info(`City ${city.name} is created successfully`)
            }
            else
            {
                if(city.name != cityFind.name)
                {
                    cityFind.name =city.name
                    await cityFind.save()
                    logger.info(`City ${cityFind.name} is updated`)
                }
            }
        }
        
    } catch (error) {
        logger.error(`Error occur while creating cities ${error.message}`)
    }
}

export default CitySeeder