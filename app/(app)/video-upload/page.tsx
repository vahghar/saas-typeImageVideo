"use client"

import React from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation';

const videoUpload = () => {

  const [file, setFile] = React.useState<File | null>(null); 
  const  [title, setTitle] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [isuploading, setIsUploading] = React.useState<boolean>(false);

  const router = useRouter();

  const MAX_FILE_SIZE = 1024 * 1024 * 70;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!file) return;
    if(file.size > MAX_FILE_SIZE){
      alert("file size too large")
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("OriginalSize",file.size.toString())

    try {
      const response = await axios.post("/api/video-upload",formData)
    } catch (error) {
      console.log(error);
    }finally{
      setIsUploading(false);
    }
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Upload Video</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='label'>
            <span className='label-text'>Title</span>
          </label>
          <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} className='input input-bordered w-full' required/>
        </div>
        <div>
          <label className='label'>
            <span className='label-text'>Description</span>
          </label>
          <input type="text" value={description} onChange={(e)=>setDescription(e.target.value)} className='input input-bordered w-full' required/>
        </div>
        <div>
          <label className='label'>
            <span className='label-text'>Video File</span>
          </label>
          <input type="file" accept='video/*' onChange={(e)=>setFile(e.target.files?.[0] || null)} className='input input-bordered w-full' required/>
        </div>
        <button type='submit' className='btn btn-primary' disabled={isuploading}>
          {isuploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  )
}

export default videoUpload

