import express from 'express';
import config from './config.js';
import Logger from 'log4js';


async function main(): Promise<void> {
    config.check();

    Logger.configure('./logger_config.json');
    const logger = Logger.getLogger('main');

    const app = express();
    app.use(express.json());
    app.use(express.static(config.get().WWW_ROOT));



    const sv = app.listen(config.get().LISTEN_PORT, () => {
        logger.info(`Express listening on port ${config.get().LISTEN_PORT}`);
    });

    // proper shutdown on Ctrl+C and kill
    const onProcessSignal = async (signal: NodeJS.Signals) => {
        logger.info('Got signal', signal);
        await new Promise<void>((r) => sv.close((err) => {
            if (err) {
                console.log('Server fail?', err);
            }
            r();
        }));
        logger.info('Bye...');
        await new Promise<void>((r) => {
            Logger.shutdown((err) => {
                if (err) {
                    console.log('Logger fail?', err);
                }
                r();
            });
        });
    };
    process.on('SIGTERM', onProcessSignal);
    process.on('SIGINT', onProcessSignal);
}

main().catch(e => console.error('Fatal error:', e));
