import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20';
import { randomBytes } from 'crypto';
import { getDb } from '../database/index.js';
import { User } from '../types/index.js';
import { config } from './index.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId!,
      clientSecret: config.googleClientSecret!,
      callbackURL: `${config.serverUrl}/api/oauth/google/callback`,
    },
    // This function runs AFTER Google verifies the user and sends us their profile
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      const db = getDb();

      try {
        const existingUser = db
          .prepare('SELECT * FROM users WHERE google_id = ?')
          .get(profile.id) as User | undefined;

        if (existingUser) {
          // User exists, login successful
          return done(null, existingUser);
        }

        const email = profile.emails?.[0].value;
        if (email) {
          const userWithEmail = db
            .prepare('SELECT * FROM users WHERE email = ?')
            .get(email) as User | undefined;

          if (userWithEmail) {
            // Link Google to existing account (Google has verified email ownership)
            db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(
              profile.id,
              userWithEmail.id
            );
            return done(null, userWithEmail);
          }
        }

        const baseName = profile.displayName
          ? profile.displayName.replace(/[^a-zA-Z0-9]/g, '')
          : 'User';

        const randomSuffix = randomBytes(3).toString('hex');
        const finalUsername = `${baseName}${randomSuffix}`;

        const stmt = db.prepare(`
                    INSERT INTO users (username, email, google_id, password_hash) VALUES (?, ?, ?, ?)
                `);

        const info = stmt.run(finalUsername, email, profile.id, null);

        const newUser = db
          .prepare('SELECT * FROM users WHERE id = ?')
          .get(info.lastInsertRowid) as User;

        return done(null, newUser);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
