// /api/log-login.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { username } = req.body || {};
        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress;
        const ua = req.headers["user-agent"];
        const time = new Date().toISOString();

        console.log("✅ LOGIN EVENT:", { username, ip, ua, time });

        res.status(200).json({ ok: true, logged: { username, ip, time } });
    } catch (err) {
        console.error("❌ Error logging login:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
