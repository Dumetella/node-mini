import { join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

interface Config {
    LISTEN_PORT: number
    WWW_ROOT: string
}

const PLACEHOLDER = '[change_me]';
const DefaultConfig: Config = {
    LISTEN_PORT: 32280,
    WWW_ROOT: './static'
};
const configPath = join(process.cwd(), 'config.json');
let CurrentConfig: Config | undefined = undefined;

function checkConfig(): void {
    if (CurrentConfig) {
        return;
    }

    try {
        if (!existsSync(configPath)) {
            CurrentConfig = DefaultConfig;
            writeConfig();
            throw new Error('Fresh config, please replace [change_me] values');
        }

        const text = readFileSync(configPath, {'encoding': 'utf-8'});
        CurrentConfig = JSON.parse(text) as Config;

        const placeholders = new Array<string>();
        for (const key in DefaultConfig) {
            if (!(key in CurrentConfig)) {
                expandConfig();
                throw new Error('Config got expanded with new values, pleace check and restart');
            }
            if (typeof CurrentConfig[key] === 'string' && CurrentConfig[key] === PLACEHOLDER) {
                placeholders.push(key);
            }
        }
        if (placeholders.length > 0) {
            throw new Error(`Config has following unset values: ${placeholders.join(', ')}`);
        }
    }
    catch (e) {
        throw new Error(`Config check failed, inner message: ${e}`);        
    }
}

function getConfig(): Config {
    checkConfig();
    return CurrentConfig;
}

function writeConfig(): void {
    writeFileSync(configPath, JSON.stringify(CurrentConfig, null, 4));
}

function expandConfig(): void {
    // copy missing values from Default to Current
    for (const key in DefaultConfig) {
        if (!Object.keys(CurrentConfig).some(c => c === key)) {
            CurrentConfig[key] = DefaultConfig[key];
        }
    }
    writeConfig();
}

export default {
    get: getConfig,
    check: checkConfig
};
