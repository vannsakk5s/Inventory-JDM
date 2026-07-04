import { Storage } from "@google-cloud/storage"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
})

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME!

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const fileName = `products/${Date.now()}-${safeName}`

    const bucket = storage.bucket(bucketName)
    const blob = bucket.file(fileName)

    await blob.save(buffer, {
      metadata: {
        contentType: file.type || "application/octet-stream",
      },
      resumable: false,
    })

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`

    return NextResponse.json({
      url: publicUrl,
      imageUrl: publicUrl,
    })
  } catch (error) {
    console.error("Google Cloud upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
