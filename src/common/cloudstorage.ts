import * as Storage from "@google-cloud/storage";
import * as promisify from "es6-promisify";
import * as getUriFunction from "get-uri";

const gcs = Storage();
const getUri = promisify(getUriFunction);

export function storeProfileImage(imgUri: string, userId: number) {
    const bucket = gcs.bucket(process.env.STORAGE_BUCKET);
    const filename = createFilenameForUser(userId);
    const file = bucket.file(filename);
    return getUri(imgUri).then((readStream) => {
        const writeStream = file.createWriteStream();
        readStream.pipe(writeStream)
        .on("error", (err) => {
            throw new Error("Could not write image; " + err);
        })
        .on("finish", () => {
            return file.makePublic();
        });
    })
    .then(() => {
        return filename;
    });
}

function createFilenameForUser(userId: number): string {
    return "profileimg-" + userId + ".jpg";
}

export function deleteProfileImage(userId: number): Promise<any> {
    const bucket = gcs.bucket(process.env.STORAGE_BUCKET);
    const filename = createFilenameForUser(userId);
    const file = bucket.file(filename);
    return file.delete();
}
