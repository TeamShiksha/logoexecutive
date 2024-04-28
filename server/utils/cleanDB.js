const firebaseConfig = require("../firebase.json");

const cleanDB= async ()=>{
  const firebaseUrl = `http://localhost:${firebaseConfig.emulators.firestore.port}`+
    `/emulator/v1/projects/${process.env.FIRESTORE_PROJECT_ID}/databases/(default)/documents`;
  return await fetch(firebaseUrl,
    {
      method:"delete"
    });
};

module.exports = {cleanDB};