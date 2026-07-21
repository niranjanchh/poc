export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Endpoint to get all saved comments
    if (url.pathname === "/api/comments" && request.method === "GET") {
      const data = await env.COMMENTS_KV.get("rfq_comments_data");
      return new Response(data || "{}", {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Endpoint to save updated comments
    if (url.pathname === "/api/comments" && request.method === "POST") {
      try {
        const body = await request.text();
        await env.COMMENTS_KV.put("rfq_comments_data", body);
        return new Response(JSON.stringify({ status: "success" }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500 });
      }
    }

    // Serve static files (Pages)
    return env.ASSETS.fetch(request);
  }
};
