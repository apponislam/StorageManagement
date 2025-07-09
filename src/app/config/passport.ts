import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "../config";
import User from "../modules/auth/auth.model";
import { prettifyName } from "../utils/prettifyName";

passport.use(
    new GoogleStrategy(
        {
            clientID: config.google_client_id!,
            clientSecret: config.google_client_secret!,
            callbackURL: `${config.google_callback_url}/api/v1/auth/google/callback`,
            passReqToCallback: true,
        },
        async (_req, _accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value || null;
                const photo = profile.photos?.[0]?.value;
                const username = prettifyName(profile.displayName || (email ? email.split("@")[0] : "user"));

                const orClause: Array<{ googleId?: string; email?: string }> = [{ googleId: profile.id }];
                if (email) orClause.push({ email });

                let user = await User.findOne({ $or: orClause });

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        username,
                        email,
                        photo,
                        authType: "google",
                        isDeleted: false,
                        storageLimit: 15 * 1024 * 1024 * 1024,
                    });
                } else if (!user.googleId) {
                    user.googleId = profile.id;
                    user.authType = "both";
                    await user.save();
                }

                done(null, user);
            } catch (error) {
                done(error as Error);
            }
        }
    )
);

export default passport;
