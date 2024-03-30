import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath)=>{
        try {
            if(!localFilePath) return null;
            // upload file on cloudinary
            const resource = await cloudinary.uploader.upload(localFilePath,
                {
                    resource_type:"auto"
            })
            // file has been uploaded successfully
            console.log(`File is uploaded successfully`,resource.url);
            return resource;
        } catch (error) {
            fs.unlink(localFilePath);
            return null;
        }
}

export {uploadOnCloudinary}
