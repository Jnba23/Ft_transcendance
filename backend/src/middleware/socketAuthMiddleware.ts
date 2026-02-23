import jwt from "jsonwebtoken"
import { getDb } from "../core/database.js"
import cookie from "cookie"
import { Socket } from "socket.io"

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
	try {
		const rawCookie = socket.handshake.headers.cookie;

		if (!rawCookie) {
			return next(new Error("Authentication error: No cookies"));
		}

		const parsedCookies = cookie.parse(rawCookie);
		const token = parsedCookies.accessToken;
		
		if (!token) {
			return (next(new Error("Authentication error: No token")));
		}

		const db = getDb();
		const isBlacklistedStmt = db.prepare(
   	   		`SELECT token FROM token_blacklist WHERE token = ?`
    	);
   		const isBlacklisted = isBlacklistedStmt.get(token);

		if (isBlacklisted) {
			return next(new Error("Authentication error: Token revoked"));
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET!);

		if (typeof decoded !== "object" || !decoded.id) {
		return next(new Error("Authentication error: Invalid payload"));
		}

		socket.data.userId = decoded.id;

		next();
	} catch (error) {
		next(new Error("Authentication error"));
	}
}