import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary'
import { Readable } from 'stream'

@Injectable()
export class CloudinaryService {
  constructor() {
   cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
})

    console.log('cloud name:', process.env.CLOUDINARY_CLOUD_NAME)
console.log('api key:', process.env.CLOUDINARY_API_KEY)
console.log('secret loaded:', !!process.env.CLOUDINARY_API_SECRET)
console.log('secret last 4:', process.env.CLOUDINARY_API_SECRET?.slice(-4))
  }

  async uploadProductImage(
    file: Express.Multer.File,
    productId: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          public_id: `${productId}-${Date.now()}`,
          resource_type: 'image',
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error || !result) {
            console.error('Cloudinary error:', error)
            reject(new InternalServerErrorException(error?.message || 'Error subiendo imagen'))
            return
          }
          resolve(result)
        },
      )

      Readable.from(file.buffer).pipe(stream)
    })
  }
}