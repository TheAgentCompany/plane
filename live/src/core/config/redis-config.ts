export type RedisConfig = string | { host: string; port: number };

export function getRedisConfig(): RedisConfig {
  const redisUrl = process.env.REDIS_URL?.trim();
  const redisHost = process.env.REDIS_HOST?.trim();
  const redisPort = process.env.REDIS_PORT?.trim();

  if (redisUrl) {
    return redisUrl;
  }

  if (redisHost && redisPort && !isNaN(Number(redisPort))) {
    return {
      host: redisHost,
      port: Number(redisPort),
    };
  }

  return "redis://localhost:6379";
}
