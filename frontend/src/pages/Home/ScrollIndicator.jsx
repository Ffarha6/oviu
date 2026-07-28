import { motion } from "framer-motion"

function ScrollIndicator() {
  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">

      <p className="text-[#C89072] text-xl mb-4">
        اسحب للأسفل
      </p>

      <div className="w-[3px] h-28 bg-[#D9A066]/20 relative overflow-hidden rounded-full">

        <motion.div
          animate={{
            y: [0, 70, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="w-full h-10 bg-[#D9A066] rounded-full"
        />

      </div>

    </div>
  )
}

export default ScrollIndicator