import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService {
    private configService;
    private readonly redis;
    constructor(configService: ConfigService);
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    setWithExpiry(key: string, value: string, seconds: number): Promise<void>;
    getKeys(pattern: string): Promise<string[]>;
    deletePattern(pattern: string): Promise<void>;
    getClient(): Redis;
}
