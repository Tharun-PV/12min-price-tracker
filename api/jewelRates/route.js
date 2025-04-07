// api/jewelRates/route.js

export const config = {
    schedule: '*/12 * * * *', // Every 12 minutes
    runtime: 'edge',
  };
  
  export default async function handler(req) {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
    const filters = {
      branch: "ecc71e26-1691-11ea-b1f7-00016cd7cb45",
      createdAtFrom: from.toISOString(),
      createdAtTo: to.toISOString(),
    };
  
    const encodedFilters = encodeURIComponent(JSON.stringify(filters));
    const url = `https://froads.trysumangaleejewellers.in/products/productrate/metadata/get-all?filters=${encodedFilters}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      const outputLines = [];
  
      outputLines.push(":moneybag: *Daily Rates*");
      outputLines.push(new Date().toLocaleString("en-IN"));
      outputLines.push("```");
      outputLines.push("NAME            PRICE");
      outputLines.push("----------------------------");
  
      const namesToShow = [
        "DIAMOND",
        "GOLD (18K)",
        "GOLD (22K)",
        "ROSEGOLD",
        "SILVER"
      ];
  
      namesToShow.forEach((name) => {
        const item = data.data.find((item) =>
          item.name.toUpperCase().includes(name.toUpperCase())
        );
        if (item) {
          const paddedName = item.name.padEnd(16, " ");
          const price = `₹ ${item.price} /gm`;
          outputLines.push(`${paddedName}${price}`);
        }
      });
  
      outputLines.push("----------------------------");
      outputLines.push("```");
  
      const message = outputLines.join("\n");
  
      // Send to Slack
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      });
  
      return new Response("Success", { status: 200 });
    } catch (error) {
      console.error("Slack Error:", error);
      return new Response("Failed", { status: 500 });
    }
  }
  