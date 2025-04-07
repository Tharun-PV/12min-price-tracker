export async function GET() {
  try {
    const now = new Date();
    const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const createdAtFrom = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const createdAtTo = new Date().toISOString();

    const url = `https://froads.trysumangaleejewellers.in/products/productrate/metadata/get-all?filters=${encodeURIComponent(
      JSON.stringify({
        branch: 'ecc71e26-1691-11ea-b1f7-00016cd7cb45',
        createdAtFrom,
        createdAtTo,
      })
    )}`;

    const response = await fetch(url);
    const data = await response.json();

    const requiredNames = ["DIAMOND", "GOLD (18K)", "GOLD (22K)", "ROSEGOLD", "SILVER"];
    const rows = requiredNames.map((name) => {
      const item = data.result?.find((r) => r.name === name);
      return `${name.padEnd(16)} ₹ ${item?.rate ?? "N/A"} /gm`;
    });

    const formatted = `:moneybag: Daily Rates\n${istDate.toLocaleString("en-IN")}\nNAME            PRICE\n----------------------------\n${rows.join(
      "\n"
    )}\n----------------------------`;

    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: formatted }),
    });

    return new Response("✅ Sent to Slack", { status: 200 });
  } catch (error) {
    console.error("Slack Error:", error);
    return new Response("❌ Failed", { status: 500 });
  }
}
