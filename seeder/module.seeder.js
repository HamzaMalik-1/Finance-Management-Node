import {Modules} from "../models/index.js" 
import logger from "../utils/logger.js";

const modules = [
  { id: 1,  name: 'Dashboard' },
  { id: 2,  name: 'Accounts' },
  { id: 3,  name: 'Transactions' },
  { id: 4,  name: 'Categories' },
  { id: 5,  name: 'Budgets' },
  { id: 6,  name: 'Reports' },
  { id: 7,  name: 'Transfers' },
  { id: 8,  name: 'Settings' },
  { id: 9,  name: 'User Management' },
  { id: 10, name: 'Audit Logs' }
];

const ModuleSeeder=async ()=>{
    try {
        let isCreated=false
        for (const item of modules) {
            const [module,created]= await Modules.findOrCreate(
                {
                    where:{id:item?.id},
                    defaults:item
                }
            
            )

            if(created)
            {
                isCreated=true
        logger.info(`Module : Id: ${module?.id} , Name: ${module?.name}`)
    }
    else if ( module?.name !== item?.name)
        {
            module.name= item.name
            await module.save()
            logger.info(`Update Module : Id: ${module?.id} , Name: ${module?.name}`)
        }
        
    };
    if(isCreated)
    {
        logger.info("Modules created successfully")
    }
    } catch (error) {
        logger.error(`❌ Error seeding modules: ${error?.message}`)
    }
    // Modules.findOrCreate()
}

export default ModuleSeeder