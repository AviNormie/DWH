import Link from 'next/link'
import React from 'react'
function DevProfile() {
  return (
    <>
            <p className='flex justify-center text-orange-600 font-semibold mt-8 '>Made with ❤️ by 
            <Link href="https://avi-profile.vercel.app/" target="_blank" rel="noopener noreferrer" className="ml-1 underline text-orange-600 font-bold hover:text-orange-500 transition-colors">Avi </Link>
            <span className="mx-1">&</span>

            <Link href="https://github.com/" target="_blank" rel="noopener noreferrer" className="ml-1 underline text-orange-600 font-bold hover:text-orange-500 transition-colors">Ipsita</Link>
        </p>
    </>
  )
}

export default DevProfile