const axios = require('axios');

/**
 * Get country information from IP address
 * Uses multiple fallback services for reliability
 */
async function getCountryFromIP(ip) {
  if (!ip || ip === '127.0.0.1' || ip === 'localhost') {
    return { country: 'Unknown', countryCode: 'XX' };
  }

  const services = [
    {
      name: 'ipapi.co',
      url: `https://ipapi.co/${ip}/json/`,
      parseResponse: (data) => ({
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || 'XX',
        city: data.city,
        region: data.region
      })
    },
    {
      name: 'ip-api.com',
      url: `http://ip-api.com/json/${ip}`,
      parseResponse: (data) => ({
        country: data.country || 'Unknown',
        countryCode: data.countryCode || 'XX',
        city: data.city,
        region: data.regionName
      })
    },
    {
      name: 'ipinfo.io',
      url: `https://ipinfo.io/${ip}/json`,
      parseResponse: (data) => ({
        country: data.country || 'Unknown',
        countryCode: data.country || 'XX',
        city: data.city,
        region: data.region
      })
    }
  ];

  for (const service of services) {
    try {
      console.log(`Trying ${service.name} for IP: ${ip}`);
      
      const response = await axios.get(service.url, {
        timeout: 3000,
        headers: {
          'User-Agent': 'Game-Vibe-Plane-Backend/1.0'
        }
      });

      if (response.data && response.status === 200) {
        const result = service.parseResponse(response.data);
        console.log(`Successfully got country data from ${service.name}:`, result);
        return result;
      }
    } catch (error) {
      console.log(`${service.name} failed:`, error.message);
      continue;
    }
  }

  console.log(`All geo-IP services failed for IP: ${ip}`);
  return { country: 'Unknown', countryCode: 'XX' };
}

/**
 * Extract IP from API Gateway event
 */
function extractIPFromEvent(event) {
  // Try various headers where the real IP might be
  const headers = event.headers || {};
  
  const ipSources = [
    headers['x-forwarded-for'],
    headers['x-real-ip'],
    headers['x-client-ip'],
    headers['cf-connecting-ip'], // Cloudflare
    event.requestContext?.identity?.sourceIp,
    event.requestContext?.http?.sourceIp
  ];

  for (const ip of ipSources) {
    if (ip) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const cleanIP = ip.split(',')[0].trim();
      if (cleanIP && cleanIP !== '127.0.0.1') {
        return cleanIP;
      }
    }
  }

  return null;
}

module.exports = {
  getCountryFromIP,
  extractIPFromEvent
};