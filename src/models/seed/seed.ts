import { logger } from '../../utils/logger'
import { clearDatabase, seedDatabase } from './initialData'

async function runSeed() {
    try {
        // first clear the database
        await clearDatabase()

        // then seed with fresh data
        await seedDatabase()

        process.exit(0)
    } catch (error) {
        logger.error('Error running seed:', error)
        process.exit(1)
    }
}

void runSeed()
