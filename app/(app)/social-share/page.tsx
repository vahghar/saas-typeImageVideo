"use client"
import React, { useState, useEffect, useRef } from 'react'
import { CldImage } from 'next-cloudinary';

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
};

type socialFormat = keyof typeof socialFormats;

const SocialShare = () => {

  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<socialFormat>("Instagram Square (1:1)");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isTransforming, setIsTransforming] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (uploadImage) {
      setIsTransforming(true);
    }
  }, [uploadImage, selectedFormat])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        throw new Error("Upload Image failed");
      }
      const data = await response.json();
      setUploadImage(data.publicId);

    } catch (error) {
      console.log(error)
      alert("Upload Image failed");
    } finally {
      setIsUploading(false);
    }
  }

  const handleDownload = () => {
    if (!imageRef.current) return;

    fetch(imageRef.current.src).then((response) => response.blob()).then((blob) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a');
      link.href = url;
      link.download = "image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    })
  }

  return (
    <div className='container mx-auto p-4 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6 text-center'>Social Media Image Creator</h1>
      <div className='card'>
        <div className='card-body'>
          <h2 className='card-title mb-4'>Upload an Image</h2>
          <div className='form-control'>
            <label className='label'>
              <span className='label-text'>Choose an image file</span>
            </label>
            <input type="file" onChange={handleFileUpload} className='file-input file-input-bordered file-input-primary w-full' />
          </div>

          {isUploading && (
            <div className='mt-4'>
              <progress className='progress progress-primary w-full' ></progress>
            </div>
          )}

          {uploadImage && (
            <div className='mt-8'>
              <h2 className='card-title mb-4'>Select Social Media Format</h2>
              <div className='form-control'>
                <select className='select select-bordered w-full' value={selectedFormat} onChange={(e) => {
                  setSelectedFormat(e.target.value as socialFormat);
                }}>{Object.keys(socialFormats).map((format) => (
                  <option key={format} value={format}>{format}</option>
                ))}
                </select>
              </div>

              <div className='mt-6 relative'>
                <h3 className='text-lg font-semibold mb-2'>Preview</h3>
                <div className='flex justify-center'>
                  {isTransforming && (
                    <div className='absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10'><span className='loading loading-spinner loading-lg'></span></div>
                  )}
                  <CldImage
                    width={socialFormats[selectedFormat].width}
                    height={socialFormats[selectedFormat].height}
                    src={uploadImage}
                    sizes="100vw"
                    alt="Transformed image"
                    crop="fill"
                    aspectRatio={socialFormats[selectedFormat].aspectRatio}
                    gravity='auto'
                    ref={imageRef}
                    onLoad={()=>setIsTransforming(false)}
                  />
                </div>
              </div>

              <div className='card-actions justify-end mt-6'>
                <button className='btn btn-primary' onClick={handleDownload}>Download for {selectedFormat}</button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SocialShare
