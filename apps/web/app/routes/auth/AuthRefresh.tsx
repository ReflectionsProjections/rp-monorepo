import { useEffect } from 'react'
import { googleAuth } from '@api/auth'

const AuthRefresh = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    googleAuth(false, redirect ?? undefined)
  }, [])

  return <p>Redirecting to login...</p>
}

export default AuthRefresh
