import { recognizeImages } from './recognize-objects';
import * as admin from 'firebase-admin';
import serviceAccount from './constants/firebase_credentials.json'

async function startTest(): Promise<void> {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  })
  try {
    const results = await recognizeImages(['https://www.uniqlo.com/jeans_innovation/eu/img/img_10.png'])
    console.log(results)

  } catch (error) {
    console.error(error)
  }
}

startTest()