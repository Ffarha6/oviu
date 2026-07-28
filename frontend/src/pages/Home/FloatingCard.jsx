function FloatingCard() {
  return (
    <div className="absolute bottom-10 left-10 bg-white/80 backdrop-blur-lg rounded-[30px] p-6 w-[320px] shadow-2xl z-20">

      <div className="flex items-center gap-4 mb-5">

        <div className="w-20 h-20 rounded-[20px] bg-[#F3ECE7]"></div>

        <div>

          <h3 className="text-2xl font-bold mb-2">
            OVIU Vision
          </h3>

          <p className="text-gray-500 text-lg">
            نظارة فاخرة
          </p>

        </div>

      </div>

      <div className="flex items-center justify-between">

        <div>

          <p className="text-gray-400 text-lg">
            السعر
          </p>

          <h2 className="text-3xl font-bold">
            1,250 جنيه
          </h2>

        </div>

        <button className="bg-[#D9A066] text-white px-6 py-3 rounded-full text-lg hover:scale-105 transition">
          شراء
        </button>

      </div>

    </div>
  )
}

export default FloatingCard