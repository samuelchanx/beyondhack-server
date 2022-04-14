/* eslint-disable @typescript-eslint/no-explicit-any */
import * as aws from 'aws-sdk'
import * as functions from 'firebase-functions'
import { region } from './constants/constants'
import axios from 'axios'

export const recognizeObjects = functions.region(region).https.onCall(async (data, context) => {
  try {
    if (!data.images) {
      return {
        success: false,
        error: 'Invalid params'
      }
    }
    const images = data.images
    const labels: string[] = await recognizeImages(images)
    return {
      success: true,
      results: labels,
    }
  } catch (error) {
    console.log(error)
    return {
      success: false
    }
  }
})

async function fetchBase64Image(imageUrl: string) {
  let imageResult = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  imageResult
  return Buffer.from(imageResult.data).toString('base64').replace(/data:.+?,/, '');
}

export const recognizeImages = async (images: string[]): Promise<string[]> => {
  var labels: string[] = []
  aws.config.loadFromPath(__dirname + '/credentials.json')
  const rekognition = new aws.Rekognition()
  for (const image of images) {
    const base64Image = await fetchBase64Image(image)
    const { Labels } = await rekognition.detectLabels({
      Image: {
        Bytes: Buffer.from(base64Image, 'base64')
      },
    }).promise()
    if (!Labels) {
      continue
    }
    labels = labels.concat(Labels.filter((l) => l.Confidence ?? 0 > 50).map((l) => l.Name ?? ''))
  }
  return labels
}
