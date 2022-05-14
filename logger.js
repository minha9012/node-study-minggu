const { createLogger, format, transports }  = require('winston');
const WinstonDaily = require('winston-daily-rotate-file');

const myFormat = format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.splat(),
        format.json(),
        myFormat,
    ),
    transports: [
        new WinstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: 'logs/error',
            filename: `%DATE%.error.log`,
            maxFiles: '30d',
            zippedArchive: true,
        }),
        new WinstonDaily({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: 'logs',
            filename: `%DATE%.log`,
            maxFiles: '30d',
            zippedArchive: true,
        }),
        new WinstonDaily({
            level: 'debug',
            datePattern: 'YYYY-MM-DD',
            dirname: 'logs/debug',
            filename: `%DATE%.debug.log`,
            maxFiles: '30d',
            zippedArchive: true,
        }),
    ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.simple(),
    }));
}

module.exports = logger;