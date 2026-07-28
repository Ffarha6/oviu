import {
  FaInstagram,
  FaFacebookF,
  FaTiktok,
} from "react-icons/fa"

function SocialSidebar() {
  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-5">

      <a
        href="https://www.instagram.com/oviu13?igsh=MmNwMHQwOXFpbXpi"
        className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-[22px] hover:bg-[#D9A066] hover:text-white transition"
      >
        <FaInstagram />
      </a>

      <a
        href="#"
        className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-[22px] hover:bg-[#D9A066] hover:text-white transition"
      >
        <FaTiktok />
      </a>

      <a
        href="https://www.facebook.com/share/1G1EUPp1m7/"
        className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-[22px] hover:bg-[#D9A066] hover:text-white transition"
      >
        <FaFacebookF />
      </a>

    </div>
  )
}

export default SocialSidebar