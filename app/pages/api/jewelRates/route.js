export const config = {
  runtime: 'edge',
  schedule: '*/12 * * * *'
};

export default async function handler() {
  const res = await fetch("https://froads.trysumangaleejewellers.in/products/productrate/metadata/get-all?filters=%7B%22branch%22%3A%22ecc71e26-1691-11ea-b1f7-00016cd7cb45%22%2C%22createdAtFrom%22%3A%222025-04-07T00%3A00%3A00Z%22%2C%22createdAtTo%22%3A%222025-04-07T23%3A59%3A59Z%22%7D");
  const data = await res.json();
  const items = data?.data || [];

  const names = ["DIAMOND", "GOLD (18K)", "GOLD (22K)", "ROSEGOLD", "SILVER"];
  const output = [];

  const now = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata"
  });

  output.push(`:moneybag: *Daily Rates*\n${now}`);
  output.push("NAME            PRICE");
  output.push("----------------------------");

  names.forEach(name => {
    const item = items.find(i => i.name.toUpperCase().includes(name.toUpperCase()));
    if (item) {
      output.push(`${name.padEnd(16)}₹ ${item.price} /gm`);
    }
  });

  output.push("----------------------------");

  const slackPayload = {
    text: output.join("\n")
  };

  await fetch("https://hooks.slack.com/services/your/webhook/url", {
    method: "POST",
    body: JSON.stringify(slackPayload),
    headers: { "Content-Type": "application/json" }
  });

  return new Response("Slack message sent");
}
