/** @type {import('next').NextConfig} */
const nextConfig = {
  // Oculta el header "X-Powered-By: Next.js"
  poweredByHeader: false,

  // Cabeceras de seguridad HTTP
  // SOLO se activan en producción para no interferir con el desarrollo local
  // En desarrollo, HSTS y CSP pueden bloquear recursos porque usamos http://localhost
  async headers() {
    // En desarrollo, no añadir headers de seguridad estrictos
    if (process.env.NODE_ENV === 'development') {
      return []
    }

    return [
      {
        // Aplicar a TODAS las rutas
        source: '/:path*',
        headers: [
          // Evita que el navegador "adivine" el tipo de archivo
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Evita que tu web se cargue dentro de un iframe de otro sitio
          { key: 'X-Frame-Options', value: 'DENY' },
          // Política de referencia
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permisos del navegador
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // HSTS: solo en producción (en localhost NO hay HTTPS)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // CSP: Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' https://outopbbvhsmrtcdqshvr.supabase.co",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
