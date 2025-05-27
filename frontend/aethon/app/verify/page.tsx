"use client"

import Link from "next/link"
import { useState, useRef, useCallback, use } from "react"
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1920,
  height: 1080,
  facingMode: "user",
}

export default function verify() {
  const [current, set] = useState<"default" | "prescription" | "review" | "photo" | "upload" | "url">("default");
  const [file, setFile] = useState<File>()
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  
  const capture = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      setImage(screenshot);
    }
  }, [webcamRef]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    try {
      const data = new FormData()
      data.set('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      })
      // handle the error
      if (!res.ok) throw new Error(await res.text())
    } catch (e: any) {
      // Handle errors here
      console.error(e)
    }
  }

  return (
    <main>
      <section className="flex flex-col items-center py-50">
        <div className="w-full max-w-4xl flex flex-col gap-6 bg-gray-800 p-6 rounded-2xl shadow-xl z-10 items-center">
          <div className="flex gap-5 p-5 w-19/20">
            <section className="w-1/2 p-5"> 
              <div className="w-full max-w-4xl flex flex-col gap-2 bg-white p-5 rounded-sm z-20">
                <button onClick={() => set("prescription")} className="text-black self-start text-xl curser-pointer"> 
                  Prescription 
                </button>
                <button onClick={() => set("review")} className="text-black self-start text-xl curser-pointer"> 
                  Online review
                </button>
                <hr className="border border-black"/>
                { current == "prescription" && 
                  <div className="w-full flex flex-col gap-2">
                    <button onClick={() => set("photo")} className="text-black self-start text-xl curser-pointer"> Take photo </button>
                    <button onClick={() => set("upload")} className="text-black self-start text-xl curser-pointer"> Upload photo </button>
                  </div> }
                {current == "review" && <p className="text-black text-xl"> Please enter the url to the online review </p>}
              </div>
            </section>
            <section className="w-1/2 p-5"> 
              <div className="w-full max-w-4xl flex flex-col gap-5 bg-white p-5 rounded-sm z-20">
                { current == "photo" &&
                <div className="w-full flex flex-col items-center">
                  {!image ? (
                    <>
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        className="border border-black gap-5" />
                      <button  onClick={capture} className="py-3 px-2 bg-blue-800 text-white rounded-full hover:bg-purple-500">
                        Take Photo
                      </button>
                    </>
                  ) : ( 
                    <>
                      <img src={image} alt="Captured" />
                      <button onClick={() => setImage(null)} className="py-3 px-2 bg-blue-800 text-white rounded-full hover:bg-purple-500" >
                        Retake
                      </button>
                      </>
                    )}
                </div> 
                }
                { current == "review" && 
                  <form className="w-full flex flex-col gap-2">
                    <input 
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="border-2 border-black text-black bg-white"/>
                  </form> }
                { current == "upload" &&
                  <form onSubmit={onSubmit} className="text-black flex flex-col w-full items-start">
                    <input type="file" name="file" onChange={(e) => setFile(e.target.files?.[0])} className="curser-pointer border border-gray-300 bg-gray-200 px-1 py-1"/>
                    <input type="submit" value="Upload" className="text-black cursor-pointer py-1 px-2 border border-gray-300 bg-gray-200"/>
                  </form> }
              </div>
            </section>
          </div>
          <div className="flex py-5 items-center">
            <button className=" px-5 py-2 border-2 border-black bg-white text-black rounded-full hover:bg-purple-500">
              <Link href="\verify\analyse"> Submit </Link>
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}