export default {
    async scheduled(event, env, ctx) {
        const webhookUrl = env.GCHAT_WEBHOOK_URL;
        if (!webhookUrl) {
            console.error("GCHAT_WEBHOOK_URL not configured");
            return;
        }

        const endpoints = [
            { name: 'Frontend', url: 'https://sunmooncal.com/' },
            { name: 'Backend API', url: 'https://api.sunmooncal.com/sync?lat=9.9252&lng=78.1198&tz=Asia/Kolkata&dst=true' }
        ];

        let hasError = false;
        let alertMessage = "*Sun Moon Calendar - Monitor Alert*\n\n";

        for (const ep of endpoints) {
            try {
                const response = await fetch(ep.url, {
                    headers: { 'User-Agent': 'SunMoonCal-Monitor/1.0' }
                });
                
                if (!response.ok) {
                    hasError = true;
                    alertMessage += `⚠️ **${ep.name}** is DOWN! Status: ${response.status} ${response.statusText}\n`;
                }
            } catch (err) {
                hasError = true;
                alertMessage += `🚨 **${ep.name}** is UNREACHABLE! Error: ${err.message}\n`;
            }
        }

        if (hasError) {
            alertMessage += "\n_Please check the Cloudflare Dashboard immediately to verify limits or quota exhaustion._";
            
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: alertMessage })
            });
        }
    }
};
