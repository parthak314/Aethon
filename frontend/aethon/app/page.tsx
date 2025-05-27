import Link from "next/link"

export default function Home() {
  return (
    <main>
      <section className="flex flex-col items-center py-10">
        <div className="w-full max-w-4xl flex flex-col gap-6 bg-gray-800 p-6 rounded-2xl shadow-xl z-10 items-center">
          <div className="flex content-center py-15">
            <h1 className="text-4xl font-bold text-white">
              Welcome, verify fraudulent stuff here
            </h1>
          </div>
          <div className="flex py-5">
            <button className="px-2 py-2 border-2 border-black bg-white text-black rounded-full hover:bg-purple-500">
              <Link href="/verify">Find out here</Link>
            </button>
          </div>
        </div>
      </section>
      <section className="flex flex-col py-6 px-10">
        <div className="flex text-white">
          <h1 className="text-3xl font-bold text-black">
            About
          </h1>
        </div>
        <div className="flex text-black text-1xl py-5">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer at ante ac risus sagittis viverra. Quisque et est ligula. Suspendisse et odio at magna auctor hendrerit. Vestibulum egestas tortor non risus iaculis, sed rhoncus elit lobortis. Ut imperdiet eget turpis eu posuere. Vestibulum condimentum aliquet placerat. Nam id erat a ante lobortis eleifend. Proin vel augue ipsum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nullam aliquet dui enim, rutrum fringilla nulla egestas in. Nunc sed molestie ligula, a dignissim felis. Nam nec massa ac diam luctus tristique. Integer dapibus ligula libero, at placerat arcu laoreet vel.
        </div>
      </section>
    </main>
  )
}
