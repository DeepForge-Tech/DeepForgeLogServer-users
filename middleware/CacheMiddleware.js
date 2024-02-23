const redis = require('redis');

const client = redis.createClient({
    password: 'NUHzmBKkhHtiUwF7H10Xi5I7vDsAZZbc',
    socket: {
        host: 'redis-15857.c328.europe-west3-1.gce.cloud.redislabs.com',
        port: 15857
    }
});
(async () => { 
    await client.connect(); 
})(); 
console.log("Connecting to the Redis"); 
  
client.on("ready", () => { 
    console.log("Connected!"); 
}); 
  
client.on("error", (err) => { 
    console.log("Error in the Connection"); 
}); 
const CacheMiddleware = (req, res, next) => {
  const { method, url } = req;

  // Cache data for write and put requests
  if (method === 'POST' || method === 'PUT') {
    const { body } = req;

    // Store the data in Redis with a TTL of 1 hour
    client.setex(url, 3600, JSON.stringify(body));
  }

  // Retrieve data from Redis for read requests
  if (method === 'GET') {
    client.get(url, async (err, data) => {
      if (data) {
        // If data is found in Redis, return it as the response
        res.send(JSON.parse(data));
      } else {
        // If data is not found in Redis, continue to the next middleware or route handler
        next();
      }
    });
  } else {
    // If the request method is not GET, continue to the next middleware or route handler
    next();
  }
};

module.exports = CacheMiddleware;