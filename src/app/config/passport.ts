import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "../config";
import User from "../modules/auth/auth.model";

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: config.google_client_id as string,
            clientSecret: config.google_client_secret as string,
            callbackURL: `${config.google_callback_url}/api/v1/auth/google/callback`,
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const photo = profile.photos?.[0]?.value;
                const username = profile.displayName || email?.split("@")[0] || "user";

                let user = await User.findOne({
                    $or: [{ googleId: profile.id }, { email: email }],
                });

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        username,
                        email,
                        photo,
                        authType: "google",
                        isDeleted: false,
                        storageLimit: 15 * 1024 * 1024 * 1024,
                        password: undefined,
                    });
                } else if (!user.googleId) {
                    user.googleId = profile.id;
                    user.authType = "both";
                    await user.save();
                }

                done(null, user);
            } catch (err) {
                done(err);
            }
        }
    )
);

export default passport;
