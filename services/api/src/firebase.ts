import * as admin from "firebase-admin";
import Config from "./config";

// We only want to initialize the firebase admin once
let initialized = false;
export function getFirebaseAdmin() {
    if (!initialized) {
        // Ref: https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments
        // Deployments provide the downloaded service account JSON's fields as
        // individual env vars rather than a file path on disk.
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: Config.FIREBASE_PROJECT_ID,
                clientEmail: Config.FIREBASE_CLIENT_EMAIL,
                privateKey: Config.FIREBASE_PRIVATE_KEY,
            }),
        });
        initialized = true;
    }

    return admin;
}
