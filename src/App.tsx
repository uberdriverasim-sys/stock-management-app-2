import React, { useState } from 'react';
import { InventoryProvider } from './store/inventory';
import { RequestProvider } from './store/requests';
import { AuthProvider, useAuth } from './store/auth';
import { LogoProvider } from './store/logo';
import { AddProductForm } from './components/AddProductForm';
import { InventoryTable } from './components/InventoryTable';
import { ShopRequestForm } from './components/ShopRequestForm';
import { RequestQueue } from './components/RequestQueue';
import { AdminPanel } from './components/AdminPanel';
import { AuthLogin } from './components/AuthLogin';
import { Branding } from './components/Branding';

function MainApp() {
	const { user, userProfile, signOut, loading } = useAuth();
	const [activeTab, setActiveTab] = useState<'admin' | 'warehouse' | 'shop'>('warehouse');
	const [loadingTimeout, setLoadingTimeout] = useState(false);

	// Set a timeout for loading
	React.useEffect(() => {
		if (loading) {
			const timer = setTimeout(() => {
				console.warn('⚠️ Loading timeout - showing login');
				setLoadingTimeout(true);
			}, 5000); // 5 second timeout

			return () => clearTimeout(timer);
		}
	}, [loading]);

	// Show login if no user OR if loading timed out
	if (!user || loadingTimeout) {
		return <AuthLogin />;
	}

	// Show loading while fetching user profile (but only briefly)
    if (loading && !loadingTimeout) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '1.2rem',
                gap: '16px'
            }}>
                <div>🔄 Loading user profile...</div>
            </div>
        );
    }

	// If we have a user but no profile, create a temporary profile
	const effectiveProfile = userProfile || {
		id: 'temp',
		name: user.email?.split('@')[0] || 'User',
		username: user.email || 'user',
		role: 'admin' as const,
		city: undefined,
		created_at: new Date().toISOString()
	};

	// Get available tabs based on user role
	const getAvailableTabs = () => {
		if (effectiveProfile.role === 'admin') {
			return ['admin', 'warehouse', 'shop'];
		}
		if (effectiveProfile.role === 'warehouse') {
			return ['warehouse'];
		}
		return ['shop'];
	};

	const availableTabs = getAvailableTabs();
	
	// Set default tab based on user role
	const getDefaultTab = () => {
		if (effectiveProfile.role === 'admin') return 'admin';
		if (effectiveProfile.role === 'warehouse') return 'warehouse';
		return 'shop';
	};

	// Ensure current tab is available for user
	if (!availableTabs.includes(activeTab)) {
		const defaultTab = getDefaultTab();
		setActiveTab(defaultTab as any);
	}

	return (
		<div className="app-container">
			{/* Branding */}
			<Branding />

			{/* User Info & Logout */}
			<div style={{
				position: 'absolute',
				top: '20px',
				right: '20px',
				display: 'flex',
				alignItems: 'center',
				gap: '12px',
				background: 'white',
				padding: '8px 16px',
				borderRadius: '8px',
				boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
				zIndex: 1000
			}}>
				<span style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>
					👤 {userProfile.name} {userProfile.city && `(${userProfile.city})`}
				</span>
				<button
					onClick={signOut}
					style={{
						padding: '4px 8px',
						background: 'var(--text-light)',
						fontSize: '0.8rem'
					}}
				>
					Logout
				</button>
			</div>

			{/* Main Content */}
			<div className="main-content">
				<div style={{ textAlign: 'center', marginBottom: '32px' }}>
					<h1>Stock Management System</h1>
					<p style={{ 
						fontSize: '1rem', 
						color: '#6C757D', 
						margin: '0'
					}}>
						Welcome, {effectiveProfile.name}!
					</p>
				</div>
				
				{/* Tab Navigation */}
				{availableTabs.length > 1 && (
					<div className="tab-nav">
						{availableTabs.includes('admin') && (
							<button
								className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
								onClick={() => setActiveTab('admin')}
							>
								⚙️ Admin Panel
							</button>
						)}
						{availableTabs.includes('warehouse') && (
							<button
								className={`tab-button ${activeTab === 'warehouse' ? 'active' : ''}`}
								onClick={() => setActiveTab('warehouse')}
							>
								📦 Warehouse Manager
							</button>
						)}
						{availableTabs.includes('shop') && (
							<button
								className={`tab-button ${activeTab === 'shop' ? 'active' : ''}`}
								onClick={() => setActiveTab('shop')}
							>
								🏪 Shop Manager
							</button>
						)}
					</div>
				)}

				{/* Content based on active tab */}
				{activeTab === 'admin' && <AdminPanel />}

				{activeTab === 'warehouse' && (
					<div style={{ display: 'grid', gap: 24 }}>
						<div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
							<section>
								<h2>Add Product</h2>
								<AddProductForm />
							</section>
							<section>
								<h2>Inventory</h2>
								<InventoryTable />
							</section>
						</div>
						<section>
							<h2>Shop Requests</h2>
							<p style={{ margin: '0 0 16px', color: '#6b7280' }}>
								Manage requests from your shops. Approve, dispatch, or cancel requests as needed.
							</p>
							<RequestQueue />
						</section>
					</div>
				)}

				{activeTab === 'shop' && (
					<div style={{ display: 'grid', gap: 24 }}>
						<section>
							<h2>Request Products</h2>
							<p style={{ margin: '0 0 16px', color: '#6b7280' }}>
								Submit requests for products you need. The warehouse manager will review and process your requests.
							</p>
							<ShopRequestForm />
						</section>
					</div>
				)}
			</div>
		</div>
	);
}

export default function App() {
	return (
		<LogoProvider>
			<AuthProvider>
				<InventoryProvider>
					<RequestProvider>
						<MainApp />
					</RequestProvider>
				</InventoryProvider>
			</AuthProvider>
		</LogoProvider>
	);
}