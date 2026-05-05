import { useEffect } from 'react'
import api from '@api/api'

function getUnauthorizedDestination(returnTo: string) {
  if (returnTo.startsWith('/admin')) {
    return '/admin/unauthorized'
  }

  return '/unauthorized'
}

const AuthCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const returnTo = decodeURIComponent(params.get('state') || '/')
    const redirectUrl = new URL('/auth/callback', window.location.origin)

    if (!code) {
      window.location.href = getUnauthorizedDestination(returnTo)
      return
    }

    api
      .post('/auth/login/web', { code, redirectUri: redirectUrl.toString() })
      .then((response) => {
        localStorage.setItem('jwt', response.data.token)
        window.location.href = returnTo
      })
      .catch(() => {
        window.location.href = getUnauthorizedDestination(returnTo)
      })
  }, [])

  return <p>Completing login...</p>
}

export default AuthCallback
