import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server"
import { UploadApiResponse } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CloudinaryUploadResult {
    public_id: string;
    bytes:number;
    duration?:number;
    [key: string]: any;
}

export async function POST(request: NextRequest) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const title = formData.get('title') as string ;
        const description = formData.get('description') as string ;
        const originalSize = formData.get('originalSize') as string ;

        if (!file) {
            return NextResponse.json({ error: "No file found" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)


        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type:"video",folder: "video-upload", transformation:[{quality:"auto",fetch_format:"mp4"}] },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else if (result) {
                            resolve(result);
                        } else {
                            reject(new Error('No upload result'));
                        }
                    }
                );
                uploadStream.end(buffer);
            }
        )
        const video = await prisma.video.create({
            data: {
                title: title,
                description: description,
                publicId: result.public_id,
                originalSize: originalSize,
                compressedSize: String(result.bytes),
                duration: result.duration || 0
            }
        })
        return NextResponse.json(video)

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Upload Video failed" }, { status: 500 })
    } finally{
        await prisma.$disconnect()
    }
}
