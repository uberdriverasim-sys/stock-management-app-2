import { LogoUpload } from './LogoUpload';

export function AdminPanel() {
	return (
		<div style={{ 
			display: 'grid', 
			gap: 32,
			maxWidth: 1000,
			margin: '0 auto'
		}}>
			{/* Logo Upload Section */}
			<section>
				<div style={{ 
					display: 'flex', 
					alignItems: 'center', 
					gap: 12, 
					marginBottom: 20 
				}}>
					<h2 style={{ margin: 0 }}>Company Logo</h2>
				</div>
				<LogoUpload />
			</section>

			{/* User Management Info */}
			<section>
				<div style={{ 
					display: 'flex', 
					alignItems: 'center', 
					gap: 12, 
					marginBottom: 20 
				}}>
					<h2 style={{ margin: 0 }}>User Management</h2>
				</div>

				<div style={{ 
					background: 'white', 
					padding: 24, 
					borderRadius: 12, 
					border: '1px solid #E5E7EB'
				}}>
					<div style={{
						padding: '20px',
						background: '#F0F9FF',
						border: '1px solid #BAE6FD',
						borderRadius: '8px',
						textAlign: 'center'
					}}>
						<h3 style={{ margin: '0 0 12px 0', color: 'var(--text-dark)' }}>
							🔐 User Management with Supabase Auth
						</h3>
						<p style={{ margin: '0 0 16px 0', color: 'var(--text-light)' }}>
							Users can now create their own accounts using the Sign Up form on the login page.
							This provides secure authentication with proper password hashing and session management.
						</p>
						<div style={{
							padding: '12px 16px',
							background: '#DBEAFE',
							borderRadius: '6px',
							fontSize: '0.9rem',
							color: '#1E40AF'
						}}>
							<strong>How to add users:</strong> Share the login page URL and have users create their own accounts with the "Sign Up" option.
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}