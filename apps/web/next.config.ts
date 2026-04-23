import type { NextConfig } from 'next'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
               process.env.API_URL || 
               'http://localhost:3000/api'

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/:path*`,
        },
      ],
    }
  },
}

export default nextConfig