export async function onRequestGet(context) {
  try {
    if (!context.env || !context.env.COMMENTS_KV) {
      return new Response(JSON.stringify({ _error: "KV_BINDING_MISSING" }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    const data = await context.env.COMMENTS_KV.get("rfq_comments_data");
    return new Response(data || "{}", {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ _error: e.message }), { headers: { "Content-Type": "application/json" } });
  }
}

export async function onRequestPost(context) {
  try {
    if (!context.env || !context.env.COMMENTS_KV) {
      return new Response(JSON.stringify({ status: "error", message: "KV_BINDING_MISSING" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    const body = await context.request.text();
    let incoming = {};
    try {
      incoming = JSON.parse(body);
    } catch (e) {
      incoming = {};
    }

    let existing = {};
    try {
      const currentRaw = await context.env.COMMENTS_KV.get("rfq_comments_data");
      if (currentRaw) {
        existing = JSON.parse(currentRaw);
      }
    } catch (e) {}

    const merged = { ...existing, ...incoming };
    await context.env.COMMENTS_KV.put("rfq_comments_data", JSON.stringify(merged));

    return new Response(JSON.stringify({ status: "success" }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ status: "error", message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
