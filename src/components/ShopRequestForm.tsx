import { useState } from 'react';
import { useRequests } from '../store/requests';
import { useInventory } from '../store/inventory';
import { useAuth } from '../store/auth';

export function ShopRequestForm() {
	const { addRequest } = useRequests();
	const { products } = useInventory();
	const { userProfile } = useAuth();
	const [selectedProductId, setSelectedProductId] = useState('');
	const [requestedQuantity, setRequestedQuantity] = useState<number | ''>('');
	const [notes, setNotes] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Get user's assigned city
	const userCity = userProfile?.city || 'UNKNOWN';

	const selectedProduct = products.find((p) => p.id === selectedProductId);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		if (!selectedProduct) {
			setError('Please select a product');
			return;
		}

		const quantity = typeof requestedQuantity === 'string' ? Number.NaN : requestedQuantity;
		const result = await addRequest({
			shop_name: `${userCity} Store`,
			shop_location: userCity,
			product_id: selectedProduct.id,
			requested_quantity: Number(quantity),
			notes: notes.trim() || undefined,
		}, userProfile?.id || 'unknown-user');

		if (!result.success) {
			setError(result.message);
		} else {
			setSuccess(result.message);
			setSelectedProductId('');
			setRequestedQuantity('');
			setNotes('');
		}
	};

	return (
		<form onSubmit={onSubmit} style={{ 
			display: 'grid', 
			gap: 16, 
			maxWidth: 600
		}}>
			{/* Display assigned location */}
			<div style={{ 
				padding: '12px 16px',
				background: 'var(--light-gray)',
				borderRadius: '8px',
				border: '2px solid var(--deep-teal)',
				marginBottom: '8px'
			}}>
				<div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '4px' }}>
					Your assigned location:
				</div>
				<div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-dark)' }}>
					📍 {userCity} Store
				</div>
			</div>

			<div style={{ display: 'grid', gap: 6 }}>
				<label htmlFor="product-select">Product</label>
				<select
					id="product-select"
					value={selectedProductId}
					onChange={(e) => setSelectedProductId(e.target.value)}
					style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
				>
					<option value="">Select a product...</option>
					{products.map((product) => (
						<option key={product.id} value={product.id}>
							{product.sku} - {product.name} (Available: {product.quantity})
						</option>
					))}
				</select>
			</div>

			<div style={{ display: 'grid', gap: 6 }}>
				<label htmlFor="requested-qty">Requested Quantity</label>
				<input
					id="requested-qty"
					type="number"
					min={1}
					step={1}
					placeholder="0"
					value={requestedQuantity}
					onChange={(e) => setRequestedQuantity(e.target.value === '' ? '' : Number(e.target.value))}
				/>
				{selectedProduct && typeof requestedQuantity === 'number' && requestedQuantity > selectedProduct.quantity && (
					<small style={{ color: '#dc2626', fontSize: '0.75rem' }}>
						Warning: Requested quantity ({requestedQuantity}) exceeds available stock ({selectedProduct.quantity})
					</small>
				)}
			</div>

			<div style={{ display: 'grid', gap: 6 }}>
				<label htmlFor="notes">Notes (Optional)</label>
				<textarea
					id="notes"
					placeholder="Any special instructions or notes..."
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					rows={3}
					style={{ 
						padding: '10px 12px', 
						border: '1px solid #d1d5db', 
						borderRadius: '8px', 
						fontSize: '1rem',
						resize: 'vertical',
						fontFamily: 'inherit'
					}}
				/>
			</div>

			<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
				<button type="submit" disabled={products.length === 0}>
					{products.length === 0 ? 'No Products Available' : 'Submit Request'}
				</button>
				{error && <span style={{ color: 'crimson' }}>{error}</span>}
				{success && <span style={{ color: 'seagreen' }}>{success}</span>}
			</div>

			{products.length === 0 && (
				<p style={{ color: '#6b7280', fontSize: '0.875rem', fontStyle: 'italic' }}>
					No products available in inventory. Please add products first.
				</p>
			)}
		</form>
	);
}
