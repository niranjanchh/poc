export async function onRequestGet(context) {
  try {
    const data = await context.env.COMMENTS_KV.get("rfq_comments_data");
    return new Response(data || "{}", {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (e) {
    return new Response("{}", { headers: { "Content-Type": "application/json" } });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.text();
    await context.env.COMMENTS_KV.put("rfq_comments_data", body);
    return new Response(JSON.stringify({ status: "success" }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500 });
  }
}
