import { useState } from 'react'
import { useAuth } from '../store/auth'

export function AuthLogin() {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<'admin' | 'warehouse' | 'shop'>('shop')
  const [city, setCity] = useState<'SYDNEY' | 'MELBOURNE' | 'BRISBANE'>('SYDNEY')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const result = await signUp(email.trim(), password, {
          name: name.trim(),
          username: username.trim(),
          role,
          city: role === 'shop' ? city : undefined
        })
        
        if (!result.success) {
          setError(result.message)
        } else {
          // Auto-login after successful signup
          const loginResult = await signIn(email.trim(), password)
          if (!loginResult.success) {
            setError('Account created but login failed. Please try signing in manually.')
          }
        }
      } else {
        const result = await signIn(email.trim(), password)
        
        if (!result.success) {
          setError(result.message)
        }
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--soft-cream)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontFamily: 'Playfair Display, serif',
            color: 'var(--navy-blue)',
            marginBottom: '8px',
            fontSize: '2.5rem'
          }}>
            THRUART
          </h1>
          <h2 style={{ 
            fontSize: '1.5rem',
            color: 'var(--text-dark)',
            marginBottom: '8px',
            fontWeight: 600
          }}>
            Stock Management
          </h2>
          <p style={{ color: 'var(--text-light)', margin: 0, fontSize: '1rem' }}>
            {isSignUp ? 'Create your account' : 'Please sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="email" style={{ 
              fontWeight: '600',
              color: 'var(--text-dark)',
              fontSize: '0.9rem'
            }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                padding: '14px 16px',
                border: '2px solid #E9ECEF',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'white'
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="password" style={{ 
              fontWeight: '600',
              color: 'var(--text-dark)',
              fontSize: '0.9rem'
            }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                padding: '14px 16px',
                border: '2px solid #E9ECEF',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'white'
              }}
              required
            />
          </div>

          {isSignUp && (
            <>
              <div style={{ display: 'grid', gap: 6 }}>
                <label htmlFor="name" style={{ 
                  fontWeight: '600',
                  color: 'var(--text-dark)',
                  fontSize: '0.9rem'
                }}>
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{
                    padding: '14px 16px',
                    border: '2px solid #E9ECEF',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <label htmlFor="username" style={{ 
                  fontWeight: '600',
                  color: 'var(--text-dark)',
                  fontSize: '0.9rem'
                }}>
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a username"
                  style={{
                    padding: '14px 16px',
                    border: '2px solid #E9ECEF',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <label htmlFor="role" style={{ 
                  fontWeight: '600',
                  color: 'var(--text-dark)',
                  fontSize: '0.9rem'
                }}>
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'warehouse' | 'shop')}
                  style={{
                    padding: '14px 16px',
                    border: '2px solid #E9ECEF',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                >
                  <option value="shop">Shop Manager</option>
                  <option value="warehouse">Warehouse Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {role === 'shop' && (
                <div style={{ display: 'grid', gap: 6 }}>
                  <label htmlFor="city" style={{ 
                    fontWeight: '600',
                    color: 'var(--text-dark)',
                    fontSize: '0.9rem'
                  }}>
                    City
                  </label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value as 'SYDNEY' | 'MELBOURNE' | 'BRISBANE')}
                    style={{
                      padding: '14px 16px',
                      border: '2px solid #E9ECEF',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'white'
                    }}
                  >
                    <option value="SYDNEY">Sydney</option>
                    <option value="MELBOURNE">Melbourne</option>
                    <option value="BRISBANE">Brisbane</option>
                  </select>
                </div>
              )}
            </>
          )}

          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              color: '#991B1B',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '14px 24px',
              background: loading ? '#CCC' : 'var(--main-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 2px 8px rgba(255, 107, 53, 0.3)'
            }}
          >
            {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            style={{
              padding: '10px',
              background: 'transparent',
              color: 'var(--deep-teal)',
              border: 'none',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </form>

        {/* Demo Info for Development */}
        {!isSignUp && (
          <div style={{ 
            marginTop: '32px', 
            padding: '20px', 
            background: 'var(--light-gray)', 
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: 'var(--text-light)'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--text-dark)' }}>
              🔑 For Development - Create accounts using Sign Up
            </div>
            <div>Use simple email formats like: admin@test.com, warehouse@test.com, sydney@test.com</div>
          </div>
        )}
      </div>
    </div>
  )
}
