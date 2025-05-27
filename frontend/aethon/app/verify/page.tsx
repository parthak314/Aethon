"use client"

import Link from "next/link"
import { useState } from "react"

export default function verify() {
  const [current, set] = useState<"default" | "prescription" | "review" | "photo" | "upload" | "url">("default");

  return (
    <main>
      <section className="flex flex-col items-center py-50">
        <div className="w-full max-w-4xl flex flex-col gap-6 bg-gray-800 p-6 rounded-2xl shadow-xl z-10 items-center">
          <div className="flex gap-5 p-5 w-19/20">
            <section className="w-1/2 p-5"> 
              <div className="w-full max-w-4xl flex flex-col gap-2 bg-white p-5 rounded-sm z-20">
                <button onClick={() => set("prescription")} className="text-black self-start text-xl"> 
                  Prescription 
                </button>
                <button onClick={() => set("review")} className="text-black self-start text-xl"> 
                  Online review
                </button>
                <hr className="border border-black"/>
                { current == "prescription" && 
                  <div className="w-full flex flex-col gap-2">
                    <button onClick={() => set("photo")} className="text-black self-start text-xl"> Take photo </button>
                    <button className="text-black self-start text-xl"> Upload photo </button>
                  </div> }
                {current == "review" && <p className="text-black text-xl"> Please enter the url to the online review </p>}
              </div>
            </section>
            <section className="w-1/2 p-5"> 
              <div className="w-full max-w-4xl flex flex-col gap-5 bg-white p-5 rounded-sm z-20">
                { current == "photo" && <p className="text-black text-xl"> Insert camera here </p> }
                { current == "review" && 
                  <div className="w-full flex flex-col gap-2">
                    <input className="border-2 border-black text-black bg-white"/>
                  </div> }
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