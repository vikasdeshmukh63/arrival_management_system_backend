import chalk from 'chalk'

// log args type
type LogArgs = unknown[]

// logger object
export const logger = {
    // info
    info: (message: string, ...args: LogArgs) => {
        console.log(chalk.cyan('ℹ INFO:'), chalk.cyan(message), ...args.map((arg) => JSON.stringify(arg)))
    },
    // success
    success: (message: string, ...args: LogArgs) => {
        console.log(chalk.green('✓ SUCCESS:'), chalk.green(message), ...args.map((arg) => JSON.stringify(arg)))
    },
    // warn
    warn: (message: string, ...args: LogArgs) => {
        console.log(chalk.yellow('⚠ WARNING:'), chalk.yellow(message), ...args.map((arg) => JSON.stringify(arg)))
    },
    // error
    error: (message: string, ...args: LogArgs) => {
        console.error(chalk.red('✖ ERROR:'), chalk.red(message), ...args.map((arg) => JSON.stringify(arg)))
    },
    // debug
    debug: (message: string, ...args: LogArgs) => {
        console.log(chalk.magenta('🔍 DEBUG:'), chalk.magenta(message), ...args.map((arg) => JSON.stringify(arg)))
    }
}
