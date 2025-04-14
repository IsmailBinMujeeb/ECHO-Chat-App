// Helper function for converting into PEM format

function convertToPEM(buffer, label) {
    const base64 = window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const lines = base64.match(/.{1,64}/g).join("\n");
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

document.getElementById("registerForm").addEventListener("submit", async (e) => {

    const keyPair = await window.crypto.subtle.generateKey(

        {
            name: "RSA-OAEP",
            modulusLenght: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"],
    );

    const publicKey = window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    const publicPem = convertToPEM(publicKey, "Public Key");
    const privatePem = convertToPEM(privateKey, "Private Key");

    const hashedPrivatePem = await window.crypto.subtle.digest("SHA-256", privatePem);

    // Stroring in IndexedDB

    const request = indexedDB.open("ECHODB", 1);

    request.onsuccess = (e) => {

        const db = e.target.result;

        const store = db.createObjectStore("users", { keyPath: "id" });

        // const tx = db.transaction("keys", "readwrite");
        // const store = tx.objectStore("keys");

        store.add({ key: "Private_Key", value: hashedPrivatePem });

        tx.oncomplete = () => db.close();
    };

    await fetch("http:localhost:3000/user/signup", { body: { userhandle: "ismaolaa", email: "osmaol@gmail.com", password: "1234", publicKey: publicPem }, method: "POST" });
    location.href = "/chat/kala";

})