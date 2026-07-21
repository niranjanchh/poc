export async function onRequestGet(context) {
  try {
    const data = await context.env.COMMENTS_KV.get("rfq_comments_data");
    const jsonStr = data || "{}";
    
    // Simple ETag hash calculation
    let hash = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      hash = ((hash << 5) - hash) + jsonStr.charCodeAt(i);
      hash |= 0;
    }
    const etag = `"comments-${Math.abs(hash)}"`;

    const clientEtag = context.request.headers.get("If-None-Match");
    if (clientEtag === etag) {
      return new Response(null, { status: 304, headers: { "ETag": etag, "Access-Control-Allow-Origin": "*" } });
    }

    return new Response(jsonStr, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "ETag": etag,
        "Cache-Control": "max-age=10, s-maxage=30"
      }
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
