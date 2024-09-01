import { Storage } from "@google-cloud/storage";
import { Request } from "express";
if (!process.env.GCP_PRIVATE_KEY) {
    throw new Error('GCP_PRIVATE_KEY is not defined in the environment variables');
  }
  

//cloud storage connect
const storageGoogle = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
      type: process.env.GCP_TYPE,
      project_id: process.env.GCP_PROJECT_ID,
      private_key_id: process.env.GCP_PRIVATE_KEY_ID,
      private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.GCP_CLIENT_EMAIL,
      client_id: process.env.GCP_CLIENT_ID,
      // auth_uri: process.env.GCP_AUTH_URI,
      // token_uri: process.env.GCP_TOKEN_URI,
      // auth_provider_x509_cert_url: process.env.GCP_AUTH_PROVIDER_X509_CERT_URL,
      // client_x509_cert_url: process.env.GCP_CLIENT_X509_CERT_URL,
      universe_domain: process.env.GCP_UNIVERSE_DOMAIN,
    },
  });
  
  //bucket initialization
  const bucketName = process.env.GCP_BUCKET_NAME || ''
  const bucket = storageGoogle.bucket(bucketName);
  


type FileType = 'profileImg' | 'resume' | 'org_logo' | 'event_poster' | 'subevent_poster'; // Extend this with more types as needed

interface FileUploadOptions {
  type?: FileType;
  file?: Express.Multer.File | undefined;
  oldFileUrl?: string;
  onFileDelete?: (fileName: string) => Promise<void>; // Optional custom delete logic
  onFileUpload?: (fileName: string) => Promise<void>; // Optional custom upload logic
}

export const handleFileUpload = async (options: FileUploadOptions): Promise<string | undefined> => {
  const { file, type, oldFileUrl, onFileDelete, onFileUpload} = options;

  if (!file){ 
    console.log(`${type} not uploaded. Returning`);
    
    return undefined;
  }

  // If there's an old file URL, delete the old file
  if (oldFileUrl) {
    console.log('oldFileUrl>>>>>>>', oldFileUrl);
    
    const oldFileName = oldFileUrl.split('/').pop();
    const oldFile = bucket.file(oldFileName as string);
    const [exists] = await oldFile.exists();
    if (exists) {
      await oldFile.delete();
      console.log("Old file deleted successfully", oldFileName);
      if (onFileDelete) await onFileDelete(oldFileName as string); // Call custom delete logic if provided
    } else {
      console.log(`${type} not found in GCS bucket:`, oldFileUrl);
    }
  }

  const newFileName = `${Date.now()}-${file.originalname}`;
  const blob = bucket.file(newFileName);
  const blobStream = blob.createWriteStream({
    metadata: { contentType: file.mimetype },
    public: true,
  });

  return new Promise<string>((resolve, reject) => {
    blobStream.on("error", (err) => {
      console.error(`${type} blob stream error`, err);
      reject(err);
    });
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${newFileName}`;
      console.log(`Finished uploading ${type} >>>>>>>`, publicUrl);
      if (onFileUpload) onFileUpload(newFileName); // Call custom upload logic if provided
      resolve(publicUrl);
    });
    blobStream.end(file.buffer);
  });
};

export const handleFileDelete =  async (options: FileUploadOptions) => {
  const {  oldFileUrl } = options;

  // If there's an old file URL, delete the old file
  if (oldFileUrl) {
    const oldFileName = oldFileUrl.split('/').pop();
    const oldFile = bucket.file(oldFileName as string);
    const [exists] = await oldFile.exists();
    if (exists) {
      await oldFile.delete();
      console.log("Old file deleted successfully", oldFileName);
    } else {
      console.log(`${oldFileUrl} not found in GCS bucket:`);
    }
  }
}





export interface MulterRequest extends Request {
    files?: {
      [fieldname: string]: Express.Multer.File[];
    } | Express.Multer.File[];
  }
  
//the function will return true if files is an object where each key is a string and each value is an array of Express.Multer.File.
export const isMulterFileArrayDictionary = (files: MulterRequest['files']) : files is {[fieldname: string]: Express.Multer.File[] } => {
    return files !== undefined && !Array.isArray(files);
  };
  
